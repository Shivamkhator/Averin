// app/api/actions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashEmail } from "@/lib/crypto";
import { embedAction } from "@/lib/embeddings";

// GET all actions for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { emailHash: hashEmail(session.user.email!) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actions = await prisma.actions.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    return NextResponse.json({ error: "Failed to fetch actions" }, { status: 500 });
  }
}

// POST create new action
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { emailHash: hashEmail(session.user.email!) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { title, isRecurring = false, isCompleted = false } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const action = await prisma.actions.create({
      data: {
        userId: user.id,
        title: title.trim(),
        isRecurring,
        isCompleted,
      },
    });
    await embedAction(action);

    return NextResponse.json(action);
  } catch (error) {
    console.error("Error creating action:", error);
    return NextResponse.json({ error: "Failed to create action" }, { status: 500 });
  }
}