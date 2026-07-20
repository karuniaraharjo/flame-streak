"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface MissionData {
  id: string;
  name: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  checkedInToday: boolean;
}

export interface CheckinResponse {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string;
  isNewLongest: boolean;
  isMilestone: boolean;
  milestoneDay: number | null;
}

export function useMissions() {
  return useQuery<MissionData[]>({
    queryKey: ["missions"],
    queryFn: async () => {
      const res = await fetch("/api/missions");
      if (!res.ok) throw new Error("Failed to fetch missions");
      const json = await res.json();
      return json.data;
    },
    staleTime: 30000,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();

  return useMutation<MissionData, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create mission");
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useCheckinMission() {
  const queryClient = useQueryClient();

  return useMutation<CheckinResponse, Error, { missionId: string }>({
    mutationFn: async ({ missionId }) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/api/missions/${missionId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      });
      if (!res.ok) throw new Error("Failed to check in");
      const json = await res.json();
      return json.data;
    },
    onMutate: async ({ missionId }) => {
      await queryClient.cancelQueries({ queryKey: ["missions"] });
      const previous = queryClient.getQueryData<MissionData[]>(["missions"]);

      if (previous) {
        queryClient.setQueryData<MissionData[]>(
          ["missions"],
          previous.map((m) =>
            m.id === missionId
              ? { ...m, currentStreak: m.currentStreak + 1, checkedInToday: true }
              : m
          )
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous: MissionData[] | undefined } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData<MissionData[]>(["missions"], ctx.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["history", variables.missionId] });
    },
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (missionId) => {
      const res = await fetch(`/api/missions/${missionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete mission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}
