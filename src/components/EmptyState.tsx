"use client";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-6 py-24 px-4 text-center"
    >
      {/* Large gray flame SVG */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/20"
      >
        <path
          d="M12 2C12 2 4 8.5 4 14.5C4 18.64 7.58 22 12 22C16.42 22 20 18.64 20 14.5C20 8.5 12 2 12 2ZM12 20C8.69 20 6 17.54 6 14.5C6 10.12 11 5.12 12 4.06C13 5.12 18 10.12 18 14.5C18 17.54 15.31 20 12 20ZM12 18C14.21 18 16 16.43 16 14.5C16 12.16 13.5 9.16 12 7.5C10.5 9.16 8 12.16 8 14.5C8 16.43 9.79 18 12 18Z"
          fill="currentColor"
        />
      </svg>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white/60">
          Mulai streak pertamamu hari ini!
        </h2>
        <p className="text-base text-white/40 max-w-sm">
          Tekan tombol check-in untuk memulai perjalanan konsistensimu
        </p>
      </div>
    </motion.div>
  );
}
