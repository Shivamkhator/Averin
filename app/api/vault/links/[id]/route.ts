import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteEmbeddingsBySource } from "@/lib/embeddings";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.link.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });
  await deleteEmbeddingsBySource(session.user.id, "link", id);

  return NextResponse.json({ success: true });
}
