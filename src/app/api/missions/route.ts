import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, getTodayInTimezone } from "@/lib/streak-logic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createMissionSchema = z.object({
  name: z.string().min(1, "Nama misi tidak boleh kosong").max(50, "Nama misi maksimal 50 karakter"),
});

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  // Get timezone from user preference or query param (for simplicity we'll just get from query or default)
  const url = new URL(request.url);
  const timezone = url.searchParams.get("timezone") || "UTC";
  const todayLocal = getTodayInTimezone(timezone);

  try {
    const missions = await prisma.mission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    });

    // Lazy evaluation for each mission
    const data = missions.map((mission) => {
      const result = calculateStreak(
        mission.lastCheckinDate,
        todayLocal,
        mission.currentStreak,
        mission.longestStreak
      );

      // We only return the evaluated state, we don't save to DB until they actually check in
      const checkedInToday = result.status === "already_checked_in";
      // If the streak is dead (reset to 1) or brand new (new to 1) but they haven't checked in today, live streak is 0
      const currentStreakLive = (result.status === "reset" || result.status === "new") ? 0 : result.streak;

      return {
        id: mission.id,
        name: mission.name,
        currentStreak: currentStreakLive,
        longestStreak: result.longest,
        lastCheckinDate: mission.lastCheckinDate,
        checkedInToday,
      };
    });

    return NextResponse.json({ status: "success", data });
  } catch (error) {
    console.error("Failed to get missions:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createMissionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
      }
    });

    return NextResponse.json({ status: "success", data: mission }, { status: 201 });
  } catch (error) {
    console.error("Failed to create mission:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
