import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embedNote } from "@/lib/embeddings"


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body } = await req.json();

  if (!body || typeof body !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const note = await prisma.note.create({
  data: {
    userId: session.user.id,
    title,
    content: body,
  },

});

await embedNote({
  id: note.id,
  userId: note.userId,
  title: note.title,
  content: note.content,
})


  return NextResponse.json({
    success: true,
    note: {
      title: note.title,
      body: note.content,
      savedAt: note.updatedAt.toISOString()
    }
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    notes.map(n => ({
      id: n.id,
      title: n.title ?? "",
      body: n.content,
      createdAt: n.createdAt.toISOString(),
    }))
  );
}
