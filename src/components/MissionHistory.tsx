"use client";
import { useQuery } from "@tanstack/react-query";
import StreakHistory from "./StreakHistory";

interface MissionHistoryProps {
  missionId: string;
}

export default function MissionHistory({ missionId }: MissionHistoryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["history", missionId],
    queryFn: async () => {
      const res = await fetch(`/api/missions/${missionId}/history?limit=30`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const json = await res.json();
      return json.data.history as Array<{ date: string; checkedIn: boolean }>;
    },
    staleTime: 60000,
  });

  if (isLoading) return <div className="h-48 flex items-center justify-center text-zinc-500 animate-pulse">Memuat riwayat...</div>;
  if (error || !data) return null;

  return <StreakHistory history={data} />;
}
