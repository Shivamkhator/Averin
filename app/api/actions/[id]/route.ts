// app/api/actions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashEmail } from "@/lib/crypto";

// PATCH update action
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params; // Await params here
    const { title, isRecurring, isCompleted } = await req.json();

    const existingAction = await prisma.actions.findUnique({
      where: { id }, // Use awaited id
    });

    if (!existingAction || existingAction.userId !== user.id) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    const action = await prisma.actions.update({
      where: { id }, // Use awaited id
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error("Error updating action:", error);
    return NextResponse.json({ error: "Failed to update action" }, { status: 500 });
  }
}

// DELETE action
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed to Promise
) {
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

    const { id } = await params; // Await params here

    // Verify the action belongs to the user
    const existingAction = await prisma.actions.findUnique({
      where: { id }, // Use awaited id
    });

    if (!existingAction || existingAction.userId !== user.id) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    await prisma.actions.delete({
      where: { id }, // Use awaited id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting action:", error);
    return NextResponse.json({ error: "Failed to delete action" }, { status: 500 });
  }
}