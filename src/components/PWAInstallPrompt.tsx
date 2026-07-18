"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay so it doesn't interrupt immediate load
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-zinc-900 border border-orange-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20">
              <img src="/icon-512x512.png" alt="FlameStreak Icon" className="w-full h-full object-cover" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Install FlameStreak</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Dapatkan pengalaman aplikasi penuh! Tambahkan FlameStreak ke layar utama HP Anda agar lebih cepat diakses setiap hari.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleInstallClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                Install Sekarang
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
