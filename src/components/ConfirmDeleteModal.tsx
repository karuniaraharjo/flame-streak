"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  missionName: string;
  isDeleting: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  missionName,
  isDeleting,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 p-12 rounded-[2rem] shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Hapus Misi?</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus misi <span className="font-bold text-white">"{missionName}"</span>? Semua riwayat kalender akan terhapus secara permanen.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Misi"}
              </button>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
