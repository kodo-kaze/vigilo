"use client";

import React, { useState } from "react";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";
import LiquidNavMenu from "@/src/components/ui/LiquidNavMenu";
import LiquidGlassCard from "@/src/components/ui/LiquidGlassCard";
import LiquidGlassButton from "@/src/components/ui/LiquidGlassButton";

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

      {/* Decorative Vignette for Cinematic Contrast with central anti-glare wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(4,5,8,0.5)_0%,rgba(4,5,8,0.25)_40%,rgba(4,5,8,0.88)_100%)] pointer-events-none" />

      {/* Centerpiece Liquid Glass Card */}
      <LiquidGlassCard className="z-10 w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Top Status Capsule Pill (Styled exactly like Landing Page Conflux Pill) */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-5 shadow-sm">
          <span className="text-[11px] sm:text-xs font-mono tracking-[0.22em] text-gray-400 uppercase">
            Anomaly // Coordinate Dissolved
          </span>
        </div>

        {/* Hero Liquid Chrome Typography: 404 */}
        <div className="relative my-2 select-none">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)]">
            404
          </h1>
        </div>

        {/* Informative Text with high-contrast bold weights */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          Lost in the Conflux Mesh
        </h2>
        <p className="mt-3 text-sm sm:text-base font-medium text-white/95 leading-relaxed max-w-sm mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          The requested surveillance feed or sensor coordinate does not exist or has drifted outside the mesh topology.
        </p>

        {/* Minimalist Industrial Telemetry Strip (No AI dots) */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 py-2.5 my-6 border-y border-white/10 font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase">
          <span className="text-gray-300 font-medium">Mesh Grid</span>
          <span className="text-white/20 select-none">/</span>
          <span className="text-gray-300 font-medium">0x404_VOID</span>
          <span className="text-white/20 select-none">/</span>
          <span className="text-gray-300 font-medium">Signal Null</span>
        </div>

        {/* Liquid Glass Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <LiquidGlassButton
            href="/"
            className="w-full sm:w-auto"
            iconLeft={
              <svg
                className="w-4 h-4 text-white transition-transform duration-300 group-hover:-translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            }
          >
            Return to Portal
          </LiquidGlassButton>

          <LiquidGlassButton
            href="/dashboard"
            variant="cyan"
            className="w-full sm:w-auto"
            showArrow
          >
            Live Dashboard
          </LiquidGlassButton>
        </div>
      </LiquidGlassCard>

      {/* Liquid Glass Speed Dial Navigation & Controls */}
      <LiquidNavMenu
        isPaused={isPaused}
        onTogglePlayPause={() => setIsPaused((prev) => !prev)}
        position="bottom-right"
      />
    </main>
  );
}
