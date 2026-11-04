"use client";

import React, { useState } from "react";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";

export default function ChromeExperience() {
    const [isPaused, setIsPaused] = useState(true);

    return (
        <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">

            {/* 
        The UILORA CHROME ENGINE 
        - baseColor: Deep charcoal shadows
        - chromeColor: Pure silver highlights
        - viscosity: 0.3 makes it feel like thick mercury
        - isPaused: By default the animation is paused, toggled via bottom-right button
      */}
            <UiloraLiquidChrome
                baseColor="#050505"
                chromeColor="#f0f0f0"
                viscosity={0.3}
                speed={0.4}
                distortion={0.7}
                isPaused={isPaused}
            />

            {/* Hero Overlay */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <h1 className="text-black/40 text-8xl md:text-[14rem] font-bold tracking-tighter leading-none italic mix-blend-exclusion select-none">
                    CHROME<span className="text-black/20 not-italic">.</span>
                </h1>

                <div className="mt-16 flex flex-col items-center gap-6">
                    <p className="text-black/40 text-xs font-light tracking-[0.6em] uppercase max-w-lg leading-loose select-none">
                        A study of molten silver and high-reflectance surfaces.
                        Disturb the pool to reveal the grain.
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 right-28 text-right">
                <button className="px-8 py-3.5 border border-white/10 text-white/40 text-[9px] tracking-[0.5em] uppercase hover:border-white hover:text-white transition-all duration-700">
                    Enter Simulation
                </button>
            </div>

            {/* Circular Liquid Glass Play/Pause Button in Right Bottom Corner */}
            <div className="fixed bottom-7 right-7 z-30">
                <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-label={isPaused ? "Play background animation" : "Pause background animation"}
                    className="mac-liquid-glass group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    title={isPaused ? "Play background animation" : "Pause background animation"}
                >
                    {/* Top glass reflection arc */}
                    <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/40 to-transparent opacity-80" />

                    {/* Shimmer sweep effect */}
                    <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

                    {isPaused ? (
                        /* Play Icon */
                        <svg
                            className="relative z-10 h-5 w-5 translate-x-0.5 text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-110 group-hover:text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    ) : (
                        /* Pause Icon */
                        <svg
                            className="relative z-10 h-5 w-5 text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-110 group-hover:text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Decorative Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
        </main>
    );
}
