import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/streak/history?limit=30
 * Ambil riwayat check-in user.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { status: "error", code: "UNAUTHORIZED", message: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitParam || "30", 10) || 30, 1), 365);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { longestStreak: true },
    });

    const checkins = await prisma.checkin.findMany({
      where: { userId: session.user.id },
      orderBy: { localDate: "desc" },
      take: limit,
      select: { localDate: true },
    });

    // Generate history: list of dates with check-in status
    const checkinDates = new Set(checkins.map((c) => c.localDate));

    // Build array of last `limit` days
    const history: Array<{ date: string; checkedIn: boolean }> = [];
    const today = new Date();

    for (let i = 0; i < limit; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      history.push({
        date: dateStr,
        checkedIn: checkinDates.has(dateStr),
      });
    }

    return NextResponse.json({
      status: "success",
      data: {
        longestStreak: user?.longestStreak ?? 0,
        history,
      },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { status: "error", code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
