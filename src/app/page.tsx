"use client";

import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { data: session, status } = useSession();

  // If logged in, redirect to dashboard
  if (status === "authenticated" && session) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-red-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Flame Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-[40px] scale-150" />
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="relative"
            >
              <defs>
                <linearGradient id="flameGrad" x1="60" y1="110" x2="60" y2="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <path
                d="M60 10C60 10 25 45 25 72C25 92 40 110 60 110C80 110 95 92 95 72C95 45 60 10 60 10Z"
                fill="url(#flameGrad)"
              />
              <path
                d="M60 45C60 45 42 62 42 76C42 88 50 96 60 96C70 96 78 88 78 76C78 62 60 45 60 45Z"
                fill="#fbbf24"
                opacity="0.7"
              />
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl sm:text-6xl font-black mb-4 tracking-tight"
        >
          <span className="gradient-text-fire">Flame</span>
          <span className="text-white">Streak</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-lg sm:text-xl text-zinc-400 mb-3 leading-relaxed"
        >
          Bangun kebiasaan harianmu.
          <br />
          Jaga apimu tetap menyala. 🔥
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-sm text-zinc-500 mb-10"
        >
          Check-in setiap hari dan lacak konsistensimu dengan visualisasi streak yang memotivasi.
        </motion.p>

        {/* Login Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-orange-500/5 hover:shadow-orange-500/20 hover:bg-white/10 hover:border-orange-500/30 backdrop-blur-md transition-all duration-300 cursor-pointer"
        >
          {/* Google Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Masuk dengan Google
        </motion.button>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-xs text-zinc-600"
        >
          Gratis selamanya · Tanpa password · Privasi terjaga
        </motion.p>
      </div>
    </main>
  );
}
