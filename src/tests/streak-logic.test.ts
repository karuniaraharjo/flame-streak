import { describe, it, expect } from "vitest";
import { calculateStreak, daysBetween, isStreakAlive, getLiveStreak, isMilestone } from "../lib/streak-logic";

describe("daysBetween", () => {
  it("returns 0 for same date", () => {
    expect(daysBetween("2026-07-17", "2026-07-17")).toBe(0);
  });

  it("returns 1 for consecutive days", () => {
    expect(daysBetween("2026-07-16", "2026-07-17")).toBe(1);
  });

  it("returns correct gap for multiple days", () => {
    expect(daysBetween("2026-07-10", "2026-07-17")).toBe(7);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2026-06-30", "2026-07-01")).toBe(1);
  });

  it("handles year boundaries", () => {
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });
});

describe("calculateStreak", () => {
  it("user baru check-in pertama kali → streak = 1", () => {
    const result = calculateStreak(null, "2026-07-17", 0, 0);
    expect(result).toEqual({ streak: 1, longest: 1, status: "new" });
  });

  it("check-in hari berikutnya berturut-turut → streak bertambah 1", () => {
    const result = calculateStreak("2026-07-16", "2026-07-17", 5, 10);
    expect(result).toEqual({ streak: 6, longest: 10, status: "incremented" });
  });

  it("check-in di hari yang sama → status already_checked_in, streak tidak berubah", () => {
    const result = calculateStreak("2026-07-17", "2026-07-17", 5, 10);
    expect(result).toEqual({ streak: 5, longest: 10, status: "already_checked_in" });
  });

  it("melewatkan 1 hari penuh → streak reset ke 1", () => {
    const result = calculateStreak("2026-07-15", "2026-07-17", 5, 10);
    expect(result).toEqual({ streak: 1, longest: 10, status: "reset" });
  });

  it("melewatkan lebih dari 1 hari → streak reset ke 1", () => {
    const result = calculateStreak("2026-07-10", "2026-07-17", 5, 10);
    expect(result).toEqual({ streak: 1, longest: 10, status: "reset" });
  });

  it("longestStreak ter-update saat currentStreak melebihi rekor sebelumnya", () => {
    const result = calculateStreak("2026-07-16", "2026-07-17", 10, 10);
    expect(result).toEqual({ streak: 11, longest: 11, status: "incremented" });
  });

  it("longestStreak TIDAK berubah saat streak baru masih lebih kecil dari rekor lama", () => {
    const result = calculateStreak("2026-07-16", "2026-07-17", 3, 10);
    expect(result).toEqual({ streak: 4, longest: 10, status: "incremented" });
  });

  it("transisi 29 Februari (tahun kabisat) dihitung dengan benar", () => {
    // 2024 is a leap year
    const result = calculateStreak("2024-02-28", "2024-02-29", 5, 5);
    expect(result).toEqual({ streak: 6, longest: 6, status: "incremented" });
  });

  it("transisi 1 Maret setelah 29 Februari (tahun kabisat)", () => {
    const result = calculateStreak("2024-02-29", "2024-03-01", 6, 6);
    expect(result).toEqual({ streak: 7, longest: 7, status: "incremented" });
  });

  it("transisi 28 Feb ke 1 Maret (bukan kabisat) = berturut-turut", () => {
    const result = calculateStreak("2026-02-28", "2026-03-01", 5, 5);
    expect(result).toEqual({ streak: 6, longest: 6, status: "incremented" });
  });

  it("user baru dengan longestStreak existing tetap tertinggi", () => {
    const result = calculateStreak(null, "2026-07-17", 0, 15);
    expect(result).toEqual({ streak: 1, longest: 15, status: "new" });
  });
});

describe("isStreakAlive", () => {
  it("returns false if never checked in", () => {
    expect(isStreakAlive(null, "2026-07-17")).toBe(false);
  });

  it("returns true if checked in today", () => {
    expect(isStreakAlive("2026-07-17", "2026-07-17")).toBe(true);
  });

  it("returns true if checked in yesterday", () => {
    expect(isStreakAlive("2026-07-16", "2026-07-17")).toBe(true);
  });

  it("returns false if gap > 1 day", () => {
    expect(isStreakAlive("2026-07-15", "2026-07-17")).toBe(false);
  });
});

describe("getLiveStreak", () => {
  it("returns 0 if never checked in", () => {
    expect(getLiveStreak(null, 5, "2026-07-17")).toBe(0);
  });

  it("returns current streak if checked in today", () => {
    expect(getLiveStreak("2026-07-17", 5, "2026-07-17")).toBe(5);
  });

  it("returns current streak if checked in yesterday", () => {
    expect(getLiveStreak("2026-07-16", 5, "2026-07-17")).toBe(5);
  });

  it("returns 0 if streak expired (gap > 1)", () => {
    expect(getLiveStreak("2026-07-15", 5, "2026-07-17")).toBe(0);
  });
});

describe("isMilestone", () => {
  it("returns true for milestone values", () => {
    expect(isMilestone(7)).toBe(true);
    expect(isMilestone(30)).toBe(true);
    expect(isMilestone(100)).toBe(true);
    expect(isMilestone(365)).toBe(true);
  });

  it("returns false for non-milestone values", () => {
    expect(isMilestone(1)).toBe(false);
    expect(isMilestone(5)).toBe(false);
    expect(isMilestone(10)).toBe(false);
    expect(isMilestone(99)).toBe(false);
  });
});
