import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteEmbeddingsBySource, embedNote } from "@/lib/embeddings";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.note.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  await deleteEmbeddingsBySource(session.user.id, "note", id);

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params; // ✅ IMPORTANT

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body } = await req.json();

  const note = await prisma.note.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      title,
      content: body,
    },
  });
  await deleteEmbeddingsBySource(session.user.id, "note", id);
  await embedNote(note);

  return NextResponse.json({
    id: note.id,
    title: note.title ?? "",
    body: note.content,
    createdAt: note.createdAt.toISOString(),
  });
}
