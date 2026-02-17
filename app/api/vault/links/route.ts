import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embedLink } from "@/lib/embeddings";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { links } = await req.json();

  if (!links || !Array.isArray(links)) {
    return NextResponse.json(
      { error: "Links array is required" },
      { status: 400 },
    );
  }

  const validLinks = links.filter(
    (link) =>
      link.url && typeof link.url === "string" && link.url.trim().length > 0,
  );

  if (validLinks.length === 0) {
    return NextResponse.json(
      { error: "No valid links provided" },
      { status: 400 },
    );
  }

  await prisma.link.createMany({
    data: validLinks.map((link) => ({
      userId: session.user.id,
      url: link.url,
      title: link.title || null,
    })),
    skipDuplicates: true,
  });

  // Fetch the saved links
  const newlyAddedLinks = await prisma.link.findMany({
  where: {
    userId: session.user.id,
    url: { in: validLinks.map(l => l.url) } // Only fetch the ones we just sent
  }
});

for (const link of newlyAddedLinks) {
  await embedLink({
    id: link.id,
    userId: link.userId,
    url: link.url,
    title: link.title,
  });
}

  return NextResponse.json({
    success: true,
    links: newlyAddedLinks,
    count: newlyAddedLinks.length,
    savedAt: new Date().toISOString(),
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}
