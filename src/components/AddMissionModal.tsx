"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateMission } from "@/hooks/useMissions";

interface AddMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMissionModal({ isOpen, onClose }: AddMissionModalProps) {
  const [name, setName] = useState("");
  const { mutate: createMission, isPending } = useCreateMission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMission(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/10 p-10 rounded-3xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Buat Misi Baru</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label htmlFor="missionName" className="block text-sm font-medium text-zinc-400 mb-2">
                  Nama Misi
                </label>
                <input
                  id="missionName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Belajar Harian, Olahraga..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-lg"
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-colors text-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isPending}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-2xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isPending ? "Menyimpan..." : "Buat"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
