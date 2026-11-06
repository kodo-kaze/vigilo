"use client";

import React, { useState } from "react";
import Link from "next/link";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";
import LiquidNavMenu from "@/src/components/ui/LiquidNavMenu";

export default function NotFoundExperience() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 select-none">
      {/* 
        The Animated Liquid Chrome Engine from the Dashboard 
        - baseColor: Deep charcoal/void shadows
        - chromeColor: Pure silver liquid highlights
        - viscosity: 0.3 for heavy fluid mercury feel
        - distortion: 0.7 for dynamic mouse wake reactivity
      */}
      <UiloraLiquidChrome
        baseColor="#040508"
        chromeColor="#f0f0f0"
        viscosity={0.3}
        speed={0.4}
        distortion={0.7}
        isPaused={isPaused}
      />

      {/* Decorative Vignette for Cinematic Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_15%,rgba(4,5,8,0.78)_100%)] pointer-events-none" />

      {/* Centerpiece Liquid Glass Card */}
      <div className="relative z-10 w-full max-w-lg liquid-glass-card rounded-3xl sm:rounded-[36px] p-8 sm:p-11 text-center shadow-[0_24px_64px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-500">
        {/* Top Specular Inner Rim */}
        <div className="pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* System Error Pulse Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 backdrop-blur-md mb-4 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-rose-300 uppercase">
            Anomaly // Coordinate Dissolved
          </span>
        </div>

        {/* Hero Liquid Chrome Typography: 404 */}
        <div className="relative my-1 select-none">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white/85 to-white/20 bg-clip-text text-transparent drop-shadow-[0_12px_36px_rgba(0,0,0,0.9)]">
            404
          </h1>
        </div>

        {/* Informative Text */}
        <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight drop-shadow-md">
          Lost in the Conflux Mesh
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-300/85 leading-relaxed max-w-sm mx-auto font-normal">
          The requested surveillance feed or sensor coordinate does not exist or has drifted outside the mesh topology.
        </p>

        {/* Telemetry Status Strip */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 py-2.5 my-6 border-y border-white/10 font-mono text-[10px] sm:text-[11px] text-gray-400 tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Mesh Grid
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            0x404_VOID
          </span>
          <span className="text-white/20">•</span>
          <span className="text-gray-300">
            Signal Null
          </span>
        </div>

        {/* Liquid Glass Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="liquid-glass-btn group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-xs sm:text-sm font-medium tracking-wide text-white select-none transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <svg
              className="w-4 h-4 text-white/90 transition-transform duration-300 group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Return to Portal</span>
          </Link>

          <Link
            href="/dashboard"
            className="liquid-glass-btn group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-xs sm:text-sm font-medium tracking-wide text-white select-none transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] border-cyan-400/35"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>Live Dashboard</span>
            <svg
              className="w-4 h-4 text-white/90 transition-transform duration-300 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Liquid Glass Speed Dial Navigation & Controls */}
      <LiquidNavMenu
        isPaused={isPaused}
        onTogglePlayPause={() => setIsPaused((prev) => !prev)}
        position="bottom-right"
      />
    </main>
  );
}
