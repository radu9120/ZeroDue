"use client";

// Vercel-style minimal grid background
export function HeroMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a]" />

      {/* Grid pattern - Vercel style large squares - Light mode */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "140px 140px",
        }}
      />
      {/* Dark mode grid - more visible */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "140px 140px",
        }}
      />

      {/* Subtle radial fade from center - less aggressive */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.5)_80%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.6)_80%)]" />

      {/* Very subtle glow at top - no blur for Safari */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
