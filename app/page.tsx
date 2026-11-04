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
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                {/* Top: Powered by Conflux Model (No dot, clean & minimalist) */}
                <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-4 shadow-sm">
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-gray-400 uppercase">
                        Powered by Conflux Model
                    </span>
                </div>

                {/* Title: Vigilo (Reduced, balanced size) */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-xl select-none">
                    Vigilo
                </h1>

                {/* Subtitle: Predictive AI Pedestrian Crowd Intelligence & Flow Management */}
                <p className="mt-3.5 text-sm sm:text-base md:text-lg text-gray-300 max-w-lg leading-relaxed font-normal drop-shadow-md">
                    Predictive AI Pedestrian Crowd Intelligence &amp; Flow Management
                </p>

                {/* macOS Liquid Glass Button */}
                <div className="mt-7">
                    <Link
                        href="/dashboard"
                        className="mac-liquid-glass group inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3 text-xs sm:text-sm font-medium tracking-wide text-white"
                    >
                        {/* Upper curved glass specular reflection */}
                        <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[42%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent opacity-80" />

                        {/* Interactive shimmer sweep on hover */}
                        <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

                        <span className="relative z-10 font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            Go to Dashboard
                        </span>

                        {/* Minimal forward arrow */}
                        <svg
                            className="relative z-10 h-3.5 w-3.5 text-white/80 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

        </main>
    );
}
