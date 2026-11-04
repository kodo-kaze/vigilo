import Link from 'next/link';
import UiloraCloudBackground from '@/src/components/ui/UiloraCloudBackground';

export default function Home() {
    return (
        <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 text-center">

            {/* Ambient dynamic background */}
            <UiloraCloudBackground
                baseColor="#050505"
                cloudColor="#e0e0e0"
                speed={0.15}
                intensity={2.2}
            />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                {/* Top: Powered by Conflux Model */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-5 shadow-sm">
                    <span className="text-[11px] sm:text-xs font-mono tracking-[0.22em] text-gray-400 uppercase">
                        Powered by Conflux Model
                    </span>
                </div>

                {/* Title: Vigilo */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight drop-shadow-2xl select-none">
                    Vigilo
                </h1>

                {/* Subtitle: Predictive AI Pedestrian Crowd Intelligence & Flow Management */}
                <p className="mt-4 text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-tight max-w-xl leading-relaxed [text-wrap:balance] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                    Predictive AI Pedestrian Crowd Intelligence &amp; Flow Management
                </p>

                {/* Modern Ultra-Transparent Liquid Glass Button */}
                <div className="mt-9">
                    <Link
                        href="/dashboard"
                        className="liquid-glass-btn group inline-flex items-center gap-3 overflow-hidden rounded-full px-9 py-3.5 text-sm font-medium tracking-wide text-white select-none"
                    >
                        {/* Dynamic sheen sweep on hover */}
                        <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

                        <span className="relative z-10 font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            Go to Dashboard
                        </span>

                        {/* Minimal forward arrow */}
                        <svg
                            className="relative z-10 h-4 w-4 text-white/90 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
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
