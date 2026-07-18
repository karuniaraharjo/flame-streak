import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, getTodayInTimezone, isMilestone } from "@/lib/streak-logic";
import { checkinSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * POST /api/streak/checkin
 * Lakukan check-in harian. Atomic transaction untuk mencegah race condition.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { status: "error", code: "UNAUTHORIZED", message: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", code: "INVALID_REQUEST", message: "Request body tidak valid." },
      { status: 400 }
    );
  }

  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "error",
        code: "INVALID_TIMEZONE",
        message: parsed.error.issues[0]?.message || "Timezone tidak valid.",
      },
      { status: 400 }
    );
  }

  const { timezone } = parsed.data;
  const userId = session.user.id;

  try {
    // Atomic transaction: read → calculate → write
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // Update timezone if changed (e.g., traveling)
      if (user.timezone !== timezone) {
        await tx.user.update({
          where: { id: userId },
          data: { timezone },
        });
      }

      const today = getTodayInTimezone(timezone);
      const streakResult = calculateStreak(
        user.lastCheckinDate,
        today,
        user.currentStreak,
        user.longestStreak
      );

      if (streakResult.status === "already_checked_in") {
        return { alreadyCheckedIn: true, data: null };
      }

      // Create check-in record (unique constraint is the safety net)
      await tx.checkin.create({
        data: { userId, localDate: today },
      });

      // Update user streak data
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          currentStreak: streakResult.streak,
          longestStreak: streakResult.longest,
          lastCheckinDate: today,
        },
      });

      return {
        alreadyCheckedIn: false,
        data: {
          currentStreak: updatedUser.currentStreak,
          longestStreak: updatedUser.longestStreak,
          lastCheckinDate: today,
          isNewLongest: streakResult.streak === streakResult.longest && streakResult.status === "incremented",
          isMilestone: isMilestone(streakResult.streak),
          milestoneDay: isMilestone(streakResult.streak) ? streakResult.streak : null,
        },
      };
    });

    if (result.alreadyCheckedIn) {
      return NextResponse.json(
        { status: "error", code: "ALREADY_CHECKED_IN", message: "Kamu sudah check-in hari ini." },
        { status: 409 }
      );
    }

    return NextResponse.json({ status: "success", data: result.data });
  } catch (error) {
    // Handle Prisma unique constraint violation (race condition safety)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { status: "error", code: "ALREADY_CHECKED_IN", message: "Kamu sudah check-in hari ini." },
        { status: 409 }
      );
    }

    console.error("Error during check-in:", error);
    return NextResponse.json(
      { status: "error", code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
