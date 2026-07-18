import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayInTimezone, getLiveStreak, isStreakAlive } from "@/lib/streak-logic";
import { NextResponse } from "next/server";

/**
 * GET /api/streak
 * Ambil status streak user saat ini (lazy evaluation).
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { status: "error", code: "UNAUTHORIZED", message: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastCheckinDate: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", code: "UNAUTHORIZED", message: "User tidak ditemukan." },
        { status: 401 }
      );
    }

    const today = getTodayInTimezone(user.timezone);
    const liveStreak = getLiveStreak(user.lastCheckinDate, user.currentStreak, today);
    const checkedInToday = user.lastCheckinDate === today;
    const alive = isStreakAlive(user.lastCheckinDate, today);

    return NextResponse.json({
      status: "success",
      data: {
        currentStreak: alive ? liveStreak : 0,
        longestStreak: user.longestStreak,
        lastCheckinDate: user.lastCheckinDate,
        checkedInToday,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { status: "error", code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
