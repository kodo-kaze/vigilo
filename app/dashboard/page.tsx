"use client";

import React, { useState } from "react";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";
import LiquidNavMenu from "@/src/components/ui/LiquidNavMenu";

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

            {/* Circular Liquid Glass Play/Pause Button in Right Bottom Corner */}
            <div className="fixed bottom-7 right-7 z-30">
                <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-label={isPaused ? "Play background animation" : "Pause background animation"}
                    className="mac-liquid-glass group relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    title={isPaused ? "Play background animation" : "Pause background animation"}
                >
                    {/* Top glass reflection arc */}
                    <span className="pointer-events-none absolute inset-x-1.5 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/40 to-transparent opacity-80" />

                    {isPaused ? (
                        /* Play Icon */
                        <svg
                            className="relative z-10 h-4 w-4 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-110 group-hover:text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M6 5v14l12-7z" />
                        </svg>
                    ) : (
                        /* Pause Icon */
                        <svg
                            className="relative z-10 h-4 w-4 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-110 group-hover:text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Liquid Glass Animated Speed Dial Navigation */}
            <LiquidNavMenu position="bottom-left" />

            {/* Decorative Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
        </main>
    );
}
