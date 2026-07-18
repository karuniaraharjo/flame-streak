/**
 * streak-logic.ts — Pure functions for streak calculation.
 * No DB/HTTP dependencies — fully unit-testable.
 */

import { toZonedTime, format } from "date-fns-tz";
import { differenceInCalendarDays } from "date-fns";

export type StreakStatus = "new" | "already_checked_in" | "incremented" | "reset";

export interface StreakResult {
  streak: number;
  longest: number;
  status: StreakStatus;
}

/**
 * Calculate the number of calendar days between two date strings (YYYY-MM-DD).
 * Returns a positive integer if `to` is after `from`.
 */
export function daysBetween(from: string, to: string): number {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  return differenceInCalendarDays(toDate, fromDate);
}

/**
 * Get today's date string in the given IANA timezone, based on server UTC time.
 * This prevents client-side manipulation.
 */
export function getTodayInTimezone(timezone: string): string {
  const now = new Date(); // Server's current UTC time
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, "yyyy-MM-dd", { timeZone: timezone });
}

/**
 * Check if a streak is still alive (not expired) based on last check-in
 * and today's date in the user's timezone.
 * A streak is alive if the user checked in today or yesterday.
 */
export function isStreakAlive(lastCheckinDate: string | null, today: string): boolean {
  if (!lastCheckinDate) return false;
  const diff = daysBetween(lastCheckinDate, today);
  return diff <= 1;
}

/**
 * Core streak calculation — PURE FUNCTION.
 *
 * @param lastCheckinDate - Last check-in date (YYYY-MM-DD) or null if never checked in
 * @param today - Today's date in user's timezone (YYYY-MM-DD)
 * @param currentStreak - Current streak count stored in DB
 * @param longestStreak - Longest streak count stored in DB
 * @returns StreakResult with new streak, longest, and status
 */
export function calculateStreak(
  lastCheckinDate: string | null,
  today: string,
  currentStreak: number,
  longestStreak: number
): StreakResult {
  // First ever check-in
  if (!lastCheckinDate) {
    return { streak: 1, longest: Math.max(1, longestStreak), status: "new" };
  }

  const diffDays = daysBetween(lastCheckinDate, today);

  // Same day — already checked in
  if (diffDays === 0) {
    return { streak: currentStreak, longest: longestStreak, status: "already_checked_in" };
  }

  // Consecutive day — increment streak
  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return {
      streak: newStreak,
      longest: Math.max(newStreak, longestStreak),
      status: "incremented",
    };
  }

  // Gap > 1 day — reset streak
  return { streak: 1, longest: longestStreak, status: "reset" };
}

/**
 * Get the "live" (lazy-evaluated) current streak for display.
 * If the user hasn't checked in today or yesterday, the streak is effectively 0.
 */
export function getLiveStreak(
  lastCheckinDate: string | null,
  currentStreak: number,
  today: string
): number {
  if (!lastCheckinDate) return 0;
  const diff = daysBetween(lastCheckinDate, today);
  if (diff <= 1) return currentStreak;
  return 0;
}

/**
 * Check if a streak count is a milestone.
 */
export function isMilestone(streak: number): boolean {
  return [7, 14, 21, 30, 50, 60, 90, 100, 150, 200, 365, 500, 1000].includes(streak);
}
