import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { historyQuerySchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { id: missionId } = await params;

  // Verify the mission belongs to the user
  const mission = await prisma.mission.findUnique({
    where: { id: missionId, userId: session.user.id },
    select: { id: true }
  });

  if (!mission) {
    return NextResponse.json({ status: "error", message: "Mission not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const parsed = historyQuerySchema.safeParse({ limit: url.searchParams.get("limit") });

  if (!parsed.success) {
    return NextResponse.json({ status: "error", message: "Invalid query parameters" }, { status: 400 });
  }

  const limit = parsed.data.limit;

  try {
    const checkins = await prisma.checkin.findMany({
      where: { missionId },
      orderBy: { localDate: "desc" },
      take: limit,
      select: { localDate: true },
    });

    const history = checkins.map((c) => ({
      date: c.localDate,
      checkedIn: true,
    }));

    return NextResponse.json({
      status: "success",
      data: { history },
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ status: "error", message: "Gagal memuat riwayat" }, { status: 500 });
  }
}
