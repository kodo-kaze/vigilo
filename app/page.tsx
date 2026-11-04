import Link from 'next/link';
import UiloraCloudBackground from '@/src/components/Backgrounds&Visuals/NoiseTexture/tsx/UiloraCloudBackground';

export default function Home() {
    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 text-center">

            {/* Ambient dynamic background */}
            <UiloraCloudBackground
                baseColor="#050505"
                cloudColor="#e0e0e0"
                speed={0.15}
                intensity={2.2}
            />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                {/* Top: Powered by Conflux Model (Prominent & High-Contrast) */}
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-cyan-500/30 bg-black/60 backdrop-blur-xl mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-semibold tracking-[0.22em] text-cyan-300 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Powered by Conflux Model
                    </span>
                </div>

                {/* Title: Vigilo (Prominent, High-Presence, Depth Drop Shadow) */}
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-white tracking-tight drop-shadow-[0_6px_35px_rgba(0,0,0,0.95)] leading-none select-none">
                    Vigilo
                </h1>

                {/* Subtitle: Predictive AI Pedestrian Crowd Intelligence & Flow Management */}
                <p className="mt-6 text-xl sm:text-2xl md:text-3xl font-medium text-slate-100 max-w-3xl tracking-tight leading-snug drop-shadow-[0_3px_18px_rgba(0,0,0,0.95)]">
                    Predictive AI Pedestrian Crowd Intelligence &amp; Flow Management
                </p>

                {/* macOS Liquid Glass Button */}
                <div className="mt-10">
                    <Link
                        href="/dashboard"
                        className="mac-liquid-glass group inline-flex items-center gap-3.5 overflow-hidden rounded-full px-10 py-4 text-sm font-medium tracking-wide text-white"
                    >
                        {/* Upper curved glass specular reflection */}
                        <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[42%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent opacity-80" />

                        {/* Interactive shimmer sweep on hover */}
                        <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

                        <span className="relative z-10 font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            Go to Dashboard
                        </span>

                        {/* Minimal forward arrow */}
                        <svg
                            className="relative z-10 h-4 w-4 text-white/80 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

        </main>
    );
}
