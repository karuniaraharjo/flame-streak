"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useCallback } from "react";

interface MilestoneToastProps {
  milestone: number | null;
  onClose: () => void;
}

const CONFETTI_COLORS = [
  "#f97316", // orange
  "#fbbf24", // amber/yellow
  "#ef4444", // red
  "#f59e0b", // amber
  "#fcd34d", // yellow-300
  "#fb923c", // orange-400
  "#dc2626", // red-600
];

function getCongratulatoryMessage(milestone: number): string {
  switch (milestone) {
    case 7:
      return "Satu minggu berturut-turut! 🎉";
    case 14:
      return "Dua minggu! Luar biasa! 💪";
    case 30:
      return "Satu bulan penuh! Konsisten! 🏆";
    case 100:
      return "100 HARI! Kamu legenda! 🔥👑";
    default:
      return "Milestone baru tercapai! 🌟";
  }
}

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  duration: number;
  delay: number;
  isSquare: boolean;
  rotation: number;
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const targetX = Math.cos(piece.angle) * piece.distance;
  const targetY = Math.sin(piece.angle) * piece.distance;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.color,
        borderRadius: piece.isSquare ? "2px" : "50%",
      }}
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 1,
        rotate: 0,
      }}
      animate={{
        x: targetX,
        y: targetY + 40, // gravity pull
        scale: [0, 1.2, 0.6],
        opacity: [1, 1, 0],
        rotate: piece.rotation,
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function MilestoneToast({
  milestone,
  onClose,
}: MilestoneToastProps) {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (milestone === null) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [milestone, onClose]);

  const confettiPieces: ConfettiPiece[] = useMemo(() => {
    if (milestone === null) return [];
    const count = milestone >= 100 ? 30 : milestone >= 30 ? 25 : 20;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 4 + Math.random() * 8,
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
      distance: 80 + Math.random() * 120,
      duration: 0.8 + Math.random() * 0.6,
      delay: Math.random() * 0.3,
      isSquare: Math.random() > 0.5,
      rotation: (Math.random() - 0.5) * 720,
    }));
  }, [milestone]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {milestone !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-gray-900/90 px-10 py-10 backdrop-blur-lg shadow-2xl"
            style={{
              boxShadow:
                "0 0 60px rgba(249,115,22,0.15), 0 25px 50px rgba(0,0,0,0.5)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti burst */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {confettiPieces.map((piece) => (
                <ConfettiParticle key={piece.id} piece={piece} />
              ))}
            </div>

            {/* Milestone number */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <span className="text-7xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                🔥 {milestone}
              </span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="relative z-10 text-xl font-semibold text-gray-200"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Hari berturut-turut!
            </motion.p>

            {/* Congratulatory message */}
            <motion.p
              className="relative z-10 text-base text-gray-400"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {getCongratulatoryMessage(milestone)}
            </motion.p>

            {/* Close hint */}
            <motion.p
              className="relative z-10 mt-2 text-xs text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Ketuk di mana saja untuk menutup
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
