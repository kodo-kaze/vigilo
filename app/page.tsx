import UiloraCloudBackground from '@/src/components/ui/UiloraCloudBackground';
import LiquidGlassButton from '@/src/components/ui/LiquidGlassButton';

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
                    <LiquidGlassButton href="/dashboard" size="lg" showArrow>
                        Go to Dashboard
                    </LiquidGlassButton>
                </div>
            </div>

        </main>
    );
}
