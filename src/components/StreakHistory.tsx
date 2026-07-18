"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface StreakHistoryProps {
  history: Array<{ date: string; checkedIn: boolean }>;
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function StreakHistory({ history }: StreakHistoryProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDate = today.getDate();

  const checkedInDates = useMemo(() => {
    const set = new Set<string>();
    history.forEach((entry) => {
      if (entry.checkedIn) {
        set.add(entry.date); // expects "YYYY-MM-DD"
      }
    });
    return set;
  }, [history]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Day of week for the 1st (0=Sun, convert to Mon=0)
    const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
    const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // Monday-based

    const cells: Array<{
      day: number | null;
      dateStr: string;
      isToday: boolean;
      checkedIn: boolean;
    }> = [];

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: "", isToday: false, checkedIn: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(currentMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${currentYear}-${mm}-${dd}`;
      cells.push({
        day: d,
        dateStr,
        isToday: d === todayDate,
        checkedIn: checkedInDates.has(dateStr),
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayDate, checkedInDates]);

  const monthLabel = `${MONTH_NAMES_ID[currentMonth]} ${currentYear}`;

  return (
    <motion.div
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Month title */}
      <h3 className="mb-4 text-center text-lg font-semibold text-gray-200">
        {monthLabel}
      </h3>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        className="grid grid-cols-7 gap-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {calendarDays.map((cell, idx) => (
          <motion.div
            key={idx}
            variants={cellVariants}
            className="flex items-center justify-center"
          >
            {cell.day !== null ? (
              <div
                className={`
                  relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium
                  transition-colors duration-200
                  ${
                    cell.checkedIn
                      ? "bg-orange-500/80 text-white"
                      : "bg-white/5 text-gray-500"
                  }
                  ${cell.isToday ? "ring-2 ring-orange-400 ring-offset-1 ring-offset-transparent" : ""}
                `}
              >
                {/* Checked-in glow */}
                {cell.checkedIn && (
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      boxShadow: "0 0 8px rgba(249,115,22,0.3)",
                    }}
                  />
                )}
                <span className="relative z-10">{cell.day}</span>
              </div>
            ) : (
              <div className="h-8 w-8" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-orange-500/80" />
          <span>Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-white/5 border border-white/10" />
          <span>Belum</span>
        </div>
      </div>
    </motion.div>
  );
}
