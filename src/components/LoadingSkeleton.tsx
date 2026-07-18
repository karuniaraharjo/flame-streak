export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 py-16 px-4">
      {/* Flame circle skeleton */}
      <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />

      {/* Counter skeleton */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-40 rounded-xl bg-white/10 animate-pulse" />
        <div className="h-5 w-56 rounded-xl bg-white/10 animate-pulse" />
      </div>

      {/* Check-in button skeleton */}
      <div className="h-14 w-64 rounded-xl bg-white/10 animate-pulse" />

      {/* Stats row skeleton */}
      <div className="flex gap-4">
        <div className="h-20 w-28 rounded-xl bg-white/10 animate-pulse" />
        <div className="h-20 w-28 rounded-xl bg-white/10 animate-pulse" />
        <div className="h-20 w-28 rounded-xl bg-white/10 animate-pulse" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="w-full max-w-md">
        <div className="h-6 w-32 rounded-xl bg-white/10 animate-pulse mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
