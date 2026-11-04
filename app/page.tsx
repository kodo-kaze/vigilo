import UiloraCloudBackground from '@/src/components/Backgrounds&Visuals/NoiseTexture/tsx/UiloraCloudBackground';

export default function Home() {
    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">

            {/* 
          PROPS EXPLAINED:
          baseColor: [R, G, B] normalized 0-1. 
          speed: Multiplier for movement.
          density: Zoom level of the noise texture.
      */}
            <UiloraCloudBackground
                baseColor="#050505"    // Deep black base
                cloudColor="#e0e0e0"   // Bright grayish-white for marble veins
                speed={0.15}           // Cinematic slow movement
                intensity={2.2}        // Higher contrast for sharp "lightning" clouds
            />

            {/* Content Overlay */}
            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">
                    NEBULA
                </h1>
                <p className="mt-4 text-gray-300 text-lg md:text-xl max-w-md mx-auto">
                    High-performance WebGL domain warped noise background.
                </p>
                <button className="mt-8 px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-opacity-90 transition-all">
                    Explore the void
                </button>
            </div>

        </main>
    );
}
