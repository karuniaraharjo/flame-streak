"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface StreakFlameProps {
  streak: number;
  isAlive: boolean;
  checkedInToday: boolean;
}

function Ember({
  delay,
  xOffset,
  size,
  duration,
}: {
  delay: number;
  xOffset: number;
  size: number;
  duration: number;
}) {
  return (
    <motion.circle
      cx={100 + xOffset}
      cy={140}
      r={size}
      fill="url(#emberGradient)"
      initial={{ y: 0, opacity: 0.9, scale: 1 }}
      animate={{
        y: -80,
        opacity: 0,
        scale: 0.3,
        x: [0, xOffset * 0.5, xOffset * -0.3, xOffset * 0.2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.5,
        ease: "easeOut",
      }}
    />
  );
}

export default function StreakFlame({
  streak,
  isAlive,
  checkedInToday,
}: StreakFlameProps) {
  const isDead = streak === 0 || !isAlive;
  const isStrong = streak >= 7;
  const flameScale = isDead ? 0.8 : isStrong ? 1.15 : 1.0;

  const embers = useMemo(() => {
    if (isDead) return [];
    const count = isStrong ? Math.min(3 + Math.floor(streak / 3), 8) : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      xOffset: (Math.random() - 0.5) * 40,
      size: 2 + Math.random() * 2,
      duration: 1.5 + Math.random() * 1.0,
    }));
  }, [isDead, isStrong, streak]);

  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      {/* Glow effect behind flame */}
      <AnimatePresence>
        {!isDead && (
          <motion.div
            key="glow"
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: isStrong ? 180 : 120,
                height: isStrong ? 180 : 120,
                background: isStrong
                  ? "radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(251,146,60,0.15) 40%, transparent 70%)"
                  : "radial-gradient(circle, rgba(251,146,60,0.25) 0%, rgba(251,146,60,0.08) 40%, transparent 70%)",
                filter: isStrong ? "blur(20px)" : "blur(14px)",
              }}
              animate={
                checkedInToday
                  ? {
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 1, 0.8],
                    }
                  : {
                      scale: [1, 1.08, 1],
                      opacity: [0.7, 0.9, 0.7],
                    }
              }
              transition={{
                duration: checkedInToday ? 1.8 : 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flame SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className="relative z-10"
        width={200}
        height={200}
        animate={
          isDead
            ? { scale: flameScale, opacity: 0.3 }
            : checkedInToday
              ? {
                  scale: [flameScale, flameScale * 1.08, flameScale],
                  opacity: 1,
                }
              : {
                  scale: [flameScale * 0.95, flameScale * 1.05],
                  opacity: [0.85, 1.0],
                }
        }
        transition={
          isDead
            ? { duration: 0.5 }
            : checkedInToday
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : {
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                  ease: "easeInOut",
                }
        }
      >
        <defs>
          <linearGradient
            id="flameGradient"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={isDead ? "#6b7280" : "#ef4444"} />
            <stop offset="40%" stopColor={isDead ? "#9ca3af" : "#f97316"} />
            <stop offset="80%" stopColor={isDead ? "#d1d5db" : "#fbbf24"} />
            <stop offset="100%" stopColor={isDead ? "#e5e7eb" : "#fef08a"} />
          </linearGradient>
          <linearGradient
            id="flameInnerGradient"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={isDead ? "#9ca3af" : "#fbbf24"} />
            <stop offset="60%" stopColor={isDead ? "#d1d5db" : "#fef9c3"} />
            <stop offset="100%" stopColor={isDead ? "#f3f4f6" : "#fffbeb"} />
          </linearGradient>
          <radialGradient id="emberGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
          </radialGradient>
          <filter id="flameBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Outer flame */}
        <motion.path
          d="M100 30
             C100 30, 65 70, 60 100
             C52 140, 60 165, 75 175
             C85 182, 92 185, 100 185
             C108 185, 115 182, 125 175
             C140 165, 148 140, 140 100
             C135 70, 100 30, 100 30Z"
          fill="url(#flameGradient)"
          filter={isStrong ? undefined : "url(#flameBlur)"}
          animate={
            isDead
              ? {}
              : {
                  d: [
                    `M100 30
                     C100 30, 65 70, 60 100
                     C52 140, 60 165, 75 175
                     C85 182, 92 185, 100 185
                     C108 185, 115 182, 125 175
                     C140 165, 148 140, 140 100
                     C135 70, 100 30, 100 30Z`,
                    `M100 28
                     C100 28, 62 68, 58 98
                     C50 138, 58 166, 74 176
                     C84 183, 93 186, 100 186
                     C107 186, 116 183, 126 176
                     C142 166, 150 138, 142 98
                     C138 68, 100 28, 100 28Z`,
                    `M100 32
                     C100 32, 67 72, 62 102
                     C54 142, 62 164, 76 174
                     C86 181, 91 184, 100 184
                     C109 184, 114 181, 124 174
                     C138 164, 146 142, 138 102
                     C132 72, 100 32, 100 32Z`,
                  ],
                }
          }
          transition={{
            duration: 1.0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner flame (lighter core) */}
        <motion.path
          d="M100 70
             C100 70, 82 100, 78 120
             C74 145, 80 160, 88 168
             C93 172, 96 174, 100 174
             C104 174, 107 172, 112 168
             C120 160, 126 145, 122 120
             C118 100, 100 70, 100 70Z"
          fill="url(#flameInnerGradient)"
          opacity={isDead ? 0.4 : 0.85}
          animate={
            isDead
              ? {}
              : {
                  d: [
                    `M100 70
                     C100 70, 82 100, 78 120
                     C74 145, 80 160, 88 168
                     C93 172, 96 174, 100 174
                     C104 174, 107 172, 112 168
                     C120 160, 126 145, 122 120
                     C118 100, 100 70, 100 70Z`,
                    `M100 68
                     C100 68, 80 98, 76 118
                     C72 143, 78 161, 87 169
                     C92 173, 97 175, 100 175
                     C103 175, 108 173, 113 169
                     C122 161, 128 143, 124 118
                     C120 98, 100 68, 100 68Z`,
                  ],
                }
          }
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.15,
          }}
        />

        {/* Embers */}
        <AnimatePresence>
          {embers.map((ember) => (
            <Ember
              key={ember.id}
              delay={ember.delay}
              xOffset={ember.xOffset}
              size={ember.size}
              duration={ember.duration}
            />
          ))}
        </AnimatePresence>
      </motion.svg>

      {/* Checked-in today extra sparkle ring */}
      <AnimatePresence>
        {checkedInToday && !isDead && (
          <motion.div
            key="sparkle-ring"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/30 z-0"
            style={{ width: 160, height: 160 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
