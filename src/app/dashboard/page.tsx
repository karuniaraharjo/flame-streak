"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useStreak, useCheckin } from "@/hooks/useStreak";
import Navbar from "@/components/Navbar";
import StreakFlame from "@/components/StreakFlame";
import StreakCounter from "@/components/StreakCounter";
import CheckinButton from "@/components/CheckinButton";
import StreakHistory from "@/components/StreakHistory";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import MilestoneToast from "@/components/MilestoneToast";

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: streakData, isLoading, error } = useStreak();
  const checkin = useCheckin();
  const [milestone, setMilestone] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      window.location.href = "/";
    }
  }, [sessionStatus]);

  // Handle check-in
  const handleCheckin = () => {
    checkin.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.isMilestone && data.milestoneDay) {
          setMilestone(data.milestoneDay);
        }
      },
    });
  };

  // Loading state
  if (sessionStatus === "loading" || isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20 px-4">
          <LoadingSkeleton />
        </main>
      </>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20 px-4 gap-4">
          <p className="text-red-400 text-lg">Terjadi kesalahan saat memuat data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors"
          >
            Coba Lagi
          </button>
        </main>
      </>
    );
  }

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const checkedInToday = streakData?.checkedInToday ?? false;
  const isAlive = currentStreak > 0;
  const isFirstTime = longestStreak === 0 && currentStreak === 0 && !checkedInToday;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 mt-16">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          {/* Flame Animation */}
          <StreakFlame
            streak={currentStreak}
            isAlive={isAlive || checkedInToday}
            checkedInToday={checkedInToday}
          />

          {/* Streak Counter or Empty State */}
          {isFirstTime && !checkedInToday ? (
            <EmptyState />
          ) : (
            <StreakCounter
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              isAlive={isAlive || checkedInToday}
            />
          )}

          {/* Check-in Button */}
          <CheckinButton
            onCheckin={handleCheckin}
            isCheckedIn={checkedInToday}
            isLoading={checkin.isPending}
            streak={currentStreak}
          />

          {/* Streak History Calendar */}
          <StreakHistorySection />
        </div>
      </main>

      {/* Milestone Celebration */}
      <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
    </>
  );
}

function StreakHistorySection() {
  const [history, setHistory] = useState<Array<{ date: string; checkedIn: boolean }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/streak/history?limit=35");
        const json = await res.json();
        if (json.status === "success") {
          setHistory(json.data.history);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    fetchHistory();
  }, []);

  if (isLoadingHistory) {
    return (
      <div className="w-full glass-card p-6">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) return null;

  return <StreakHistory history={history} />;
}
