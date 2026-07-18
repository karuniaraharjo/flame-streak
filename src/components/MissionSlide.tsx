"use client";
import { useState } from "react";
import StreakFlame from "./StreakFlame";
import StreakCounter from "./StreakCounter";
import CheckinButton from "./CheckinButton";
import MissionHistory from "./MissionHistory";
import MilestoneToast from "./MilestoneToast";
import { useCheckinMission, MissionData } from "@/hooks/useMissions";

interface MissionSlideProps {
  mission: MissionData;
}

export default function MissionSlide({ mission }: MissionSlideProps) {
  const { mutate: checkin, isPending } = useCheckinMission();
  const [milestone, setMilestone] = useState<number | null>(null);

  const isAlive = mission.currentStreak > 0;

  const handleCheckin = () => {
    if (mission.checkedInToday || isPending) return;

    checkin(
      { missionId: mission.id },
      {
        onSuccess: (data) => {
          if (data.isMilestone && data.milestoneDay) {
            setMilestone(data.milestoneDay);
          }
        },
      }
    );
  };

  return (
    <div className="w-screen flex-shrink-0 flex flex-col items-center px-4 snap-center overflow-y-auto pb-20">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Mission Title */}
        <h2 className="text-2xl font-bold text-white text-center tracking-tight bg-white/5 px-6 py-2 rounded-full backdrop-blur border border-white/10 shadow-lg mt-4">
          {mission.name}
        </h2>

        {/* Flame Animation */}
        <StreakFlame
          streak={mission.currentStreak}
          isAlive={isAlive || mission.checkedInToday}
          checkedInToday={mission.checkedInToday}
        />

        {/* Streak Counter */}
        <StreakCounter
          currentStreak={mission.currentStreak}
          longestStreak={mission.longestStreak}
          isAlive={isAlive || mission.checkedInToday}
        />

        {/* Checkin Button */}
        <CheckinButton
          onCheckin={handleCheckin}
          isCheckedIn={mission.checkedInToday}
          isLoading={isPending}
          streak={mission.currentStreak}
        />

        {/* History Calendar */}
        <MissionHistory missionId={mission.id} />
      </div>

      <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
    </div>
  );
}
