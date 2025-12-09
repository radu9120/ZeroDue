"use client";

export function HeroGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Very subtle, clean gradient - no blur for Safari compatibility */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] rounded-full opacity-60 dark:opacity-30 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
