"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  isAlive: boolean;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  isAlive,
}: StreakCounterProps) {
  const isDead = currentStreak === 0 && !isAlive;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main streak display */}
      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStreak}
            className="flex items-baseline gap-2"
            initial={{ scale: 1.3, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              mass: 0.8,
            }}
          >
            {isAlive && currentStreak > 0 && (
              <motion.span
                className="text-5xl select-none"
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              >
                🔥
              </motion.span>
            )}
            <span
              className={`text-6xl font-black tracking-tight tabular-nums ${
                isDead
                  ? "text-gray-500"
                  : "bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
              }`}
            >
              {currentStreak}
            </span>
            <span
              className={`text-2xl font-bold ${
                isDead
                  ? "text-gray-500"
                  : "bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
              }`}
            >
              Hari
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Longest streak badge */}
      <motion.div
        className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span className="text-sm select-none">🏆</span>
        <span className="text-sm text-gray-400">
          Rekor terpanjang:{" "}
          <span className="font-semibold text-amber-400/80">
            {longestStreak} hari
          </span>
        </span>
      </motion.div>
    </div>
  );
}
