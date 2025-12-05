"use client";

// Clean, minimal background - just a subtle gradient
export function HeroMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Very subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />

      {/* Optional: very faint radial gradient for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gradient-radial from-blue-50/50 via-transparent to-transparent dark:from-blue-950/30 dark:via-transparent dark:to-transparent" />
    </div>
  );
}
