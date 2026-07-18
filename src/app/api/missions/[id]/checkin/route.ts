import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, getTodayInTimezone, isMilestone } from "@/lib/streak-logic";
import { checkinSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { id: missionId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 });
  }

  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: parsed.error.issues[0]?.message || "Invalid timezone" },
      { status: 400 }
    );
  }

  const { timezone } = parsed.data;
  const userId = session.user.id;

  try {
    // Atomic transaction: read mission → calculate → update mission + create checkin
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update timezone on user if it changed (optional, but good for UX)
      await tx.user.update({
        where: { id: userId },
        data: { timezone },
      });

      // Find the mission
      const mission = await tx.mission.findUnique({
        where: { id: missionId, userId },
      });

      if (!mission) {
        throw new Error("Mission not found");
      }

      const todayLocal = getTodayInTimezone(timezone);
      const calcResult = calculateStreak(
        mission.lastCheckinDate,
        todayLocal,
        mission.currentStreak,
        mission.longestStreak
      );

      if (calcResult.status === "already_checked_in") {
        throw new Error("ALREADY_CHECKED_IN");
      }

      // Valid checkin: update mission stats
      const updatedMission = await tx.mission.update({
        where: { id: missionId },
        data: {
          currentStreak: calcResult.streak,
          longestStreak: calcResult.longest,
          lastCheckinDate: todayLocal,
        },
      });

      // Create checkin record (unique constraint [missionId, localDate] ensures no duplicates)
      await tx.checkin.create({
        data: {
          missionId,
          localDate: todayLocal,
        },
      });

      return {
        updatedMission,
        isNewLongest: calcResult.streak > mission.longestStreak,
        isMilestone: isMilestone(calcResult.streak),
      };
    });

    return NextResponse.json({
      status: "success",
      data: {
        currentStreak: result.updatedMission.currentStreak,
        longestStreak: result.updatedMission.longestStreak,
        lastCheckinDate: result.updatedMission.lastCheckinDate,
        isNewLongest: result.isNewLongest,
        isMilestone: result.isMilestone,
        milestoneDay: result.isMilestone ? result.updatedMission.currentStreak : null,
      },
    });
  } catch (error: any) {
    if (error.message === "Mission not found") {
      return NextResponse.json({ status: "error", message: "Mission not found" }, { status: 404 });
    }
    if (error.message === "ALREADY_CHECKED_IN" || error.code === "P2002") {
      return NextResponse.json(
        { status: "error", code: "ALREADY_CHECKED_IN", message: "Anda sudah check-in hari ini untuk misi ini!" },
        { status: 400 }
      );
    }

    console.error("Check-in error:", error);
    return NextResponse.json({ status: "error", message: "Gagal check-in, coba lagi nanti." }, { status: 500 });
  }
}
