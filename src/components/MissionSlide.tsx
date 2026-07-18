"use client";
import { useState } from "react";
import StreakFlame from "./StreakFlame";
import StreakCounter from "./StreakCounter";
import CheckinButton from "./CheckinButton";
import MissionHistory from "./MissionHistory";
import MilestoneToast from "./MilestoneToast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useCheckinMission, useDeleteMission, MissionData } from "@/hooks/useMissions";

interface MissionSlideProps {
  mission: MissionData;
  onAddMission: () => void;
}

export default function MissionSlide({ mission, onAddMission }: MissionSlideProps) {
  const { mutate: checkin, isPending } = useCheckinMission();
  const { mutate: deleteMission, isPending: isDeleting } = useDeleteMission();
  const [milestone, setMilestone] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDelete = () => {
    deleteMission(mission.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  return (
    <div className="w-screen flex-shrink-0 flex flex-col items-center px-4 snap-center snap-always">
      <div className="w-full max-w-md flex flex-col items-center gap-6 pb-24 pt-4">
        {/* Flame Animation */}
        <StreakFlame
          streak={mission.currentStreak}
          isAlive={isAlive || mission.checkedInToday}
          checkedInToday={mission.checkedInToday}
        />

        {/* Mission Title */}
        <h2 className="text-4xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent text-center tracking-tight drop-shadow-xl mt-2 mb-2">
          {mission.name}
        </h2>

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
        
        {/* Actions Below Calendar */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onAddMission}
            className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Buat Misi
          </button>
          
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="py-3 px-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Hapus Misi
          </button>
        </div>
      </div>

      <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        missionName={mission.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
