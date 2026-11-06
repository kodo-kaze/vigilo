"use client";

import React, { useState } from "react";
import {
    UiloraLiquidChrome,
    LiquidNavMenu,
} from "@/src/components/ui";

export default function ChromeExperience() {
    const [isPaused, setIsPaused] = useState(true);

    return (
        <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">

            {/* 
        The UILORA CHROME ENGINE 
        - baseColor: Deep charcoal shadows
        - chromeColor: Pure silver highlights
        - viscosity: 0.3 makes it feel like thick mercury
        - isPaused: By default the animation is paused, toggled via menu action
      */}
            <UiloraLiquidChrome
                baseColor="#050505"
                chromeColor="#f0f0f0"
                viscosity={0.3}
                speed={0.4}
                distortion={0.7}
                isPaused={isPaused}
            />

            {/* Liquid Glass Speed Dial Navigation & Controls */}
            <LiquidNavMenu
                isPaused={isPaused}
                onTogglePlayPause={() => setIsPaused((prev) => !prev)}
                position="bottom-right"
            />

            {/* Decorative Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
        </main>
    );
}
