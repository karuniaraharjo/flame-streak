"use client";

import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import { useMissions } from "@/hooks/useMissions";
import MissionSlide from "@/components/MissionSlide";
import AddMissionModal from "@/components/AddMissionModal";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: missions, isLoading, error } = useMissions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center pt-24 px-4">
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
          <p className="text-red-400 text-lg">Terjadi kesalahan saat memuat misi Anda.</p>
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

  return (
    <div className="flex flex-col min-h-screen relative bg-black">
      <Navbar />

      <main className="flex-1 flex flex-col mt-16 relative">
        {(!missions || missions.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <EmptyState />
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsAddModalOpen(true)}
              className="mt-12 px-10 py-5 w-full max-w-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-3xl font-bold text-xl shadow-2xl shadow-orange-500/25 hover:scale-105 hover:shadow-orange-500/40 transition-all text-center"
            >
              + Buat Misi Pertama
            </motion.button>
          </div>
        ) : (
          <>
            {/* Scroll/Swipe Area for Missions */}
            <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
              {missions.map((mission) => (
                <MissionSlide key={mission.id} mission={mission} onAddMission={() => setIsAddModalOpen(true)} />
              ))}
              
              {/* Add Mission Slide / Card */}
              <div className="w-screen flex-shrink-0 flex items-center justify-center snap-center snap-always px-4">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-white/20 rounded-3xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
                    <span className="text-3xl text-zinc-400 group-hover:text-orange-400">+</span>
                  </div>
                  <span className="text-lg font-medium text-zinc-400 group-hover:text-orange-400">
                    Tambah Misi Baru
                  </span>
                </button>
              </div>
            </div>

            {/* Pagination Dots (Optional UI hint) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
              {missions.map((m, i) => (
                <div key={m.id} className="w-2 h-2 rounded-full bg-white/20" />
              ))}
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
          </>
        )}
      </main>

      <AddMissionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
