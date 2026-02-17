import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json(); // ✅ safe now
  const { attachments } = body;

  if (!Array.isArray(attachments)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const att of attachments) {
    if (typeof att.content !== "string") {
      return NextResponse.json(
        { error: "Only extracted text allowed" },
        { status: 400 }
      );
    }
  }

  await prisma.attachment.createMany({
    data: attachments.map(att => ({
      ...att,
      userId: session.user.id,
    })),
  });

  return NextResponse.json({ success: true });
}


export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attachments = await prisma.attachment.findMany({
    where: { userId: session.user.id },
    orderBy: { extractedAt: 'desc' }
  });


  return NextResponse.json(attachments);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
