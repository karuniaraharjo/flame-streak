"use client";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Brand */}
        <span className="text-lg font-bold text-white tracking-tight">
          🔥 FlameStreak
        </span>

        {/* User section */}
        {session?.user && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500/80 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/20">
                {firstLetter}
              </div>
            )}

            {/* Name */}
            <span className="text-sm text-white/80 hidden sm:inline">
              {userName}
            </span>

            {/* Logout */}
            <button
              onClick={() => signOut()}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
