"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  checkedInToday: boolean;
  timezone: string;
}

export interface CheckinResponse {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string;
  isNewLongest: boolean;
  isMilestone: boolean;
  milestoneDay: number | null;
}

export function useStreak() {
  return useQuery<StreakData>({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak");
      if (!res.ok) throw new Error("Failed to fetch streak");
      const json = await res.json();
      return json.data;
    },
    staleTime: 30000,
  });
}

export function useCheckin() {
  const queryClient = useQueryClient();

  return useMutation<CheckinResponse, Error, void>({
    mutationFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/streak/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      });
      if (!res.ok) throw new Error("Failed to check in");
      const json = await res.json();
      return json.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["streak"] });
      const previous = queryClient.getQueryData<StreakData>(["streak"]);

      if (previous) {
        queryClient.setQueryData<StreakData>(["streak"], {
          ...previous,
          currentStreak: previous.currentStreak + 1,
          checkedInToday: true,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous: StreakData | undefined } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData<StreakData>(["streak"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
}
