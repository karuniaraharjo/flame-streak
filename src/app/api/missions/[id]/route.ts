import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { id: missionId } = await params;

  try {
    // Delete mission, checkins will cascade due to onDelete: Cascade in Prisma schema
    const mission = await prisma.mission.delete({
      where: {
        id: missionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ status: "success", data: mission });
  } catch (error) {
    console.error("Failed to delete mission:", error);
    return NextResponse.json({ status: "error", message: "Mission not found or unauthorized" }, { status: 404 });
  }
}
