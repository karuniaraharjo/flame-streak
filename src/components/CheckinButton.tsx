"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CheckinButtonProps {
  onCheckin: () => void;
  isCheckedIn: boolean;
  isLoading: boolean;
  streak: number;
}

function Spinner() {
  return (
    <motion.svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </motion.svg>
  );
}

export default function CheckinButton({
  onCheckin,
  isCheckedIn,
  isLoading,
  streak,
}: CheckinButtonProps) {
  const state = isLoading ? "loading" : isCheckedIn ? "checked" : "ready";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === "ready" && (
          <motion.button
            key="ready"
            onClick={onCheckin}
            className="relative min-w-[280px] h-[60px] rounded-2xl font-bold text-lg text-white cursor-pointer overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #f59e0b 100%)",
              boxShadow: "0 10px 25px -5px rgba(249,115,22,0.25)",
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 15px 35px -5px rgba(249,115,22,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🔥</span>
              Check-in Hari Ini
            </span>
          </motion.button>
        )}

        {state === "loading" && (
          <motion.button
            key="loading"
            disabled
            className="min-w-[280px] h-[60px] rounded-2xl font-bold text-lg text-white/70 pointer-events-none"
            style={{
              background: "rgba(249,115,22,0.5)",
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <Spinner />
              Menyimpan...
            </span>
          </motion.button>
        )}

        {state === "checked" && (
          <motion.button
            key="checked"
            disabled
            className="relative min-w-[280px] h-[60px] rounded-2xl font-bold text-lg text-emerald-400 border border-emerald-500/30 cursor-default overflow-hidden"
            style={{
              background: "rgba(16,185,129,0.2)",
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            {/* Pulse glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: "inset 0 0 30px rgba(16,185,129,0.15)",
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                ✓
              </motion.span>
              Sudah Check-in Hari Ini
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Streak bonus hint */}
      <AnimatePresence>
        {state === "ready" && streak > 0 && (
          <motion.p
            className="text-center text-xs text-orange-400/50 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            Jaga streak {streak} harimu! 🔥
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
