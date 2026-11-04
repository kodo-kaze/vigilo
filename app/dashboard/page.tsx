import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";

export default function ChromeExperience() {
    return (
        <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">

            {/* 
        The UILORA CHROME ENGINE 
        - baseColor: Deep charcoal shadows
        - chromeColor: Pure silver highlights
        - viscosity: 0.3 makes it feel like thick mercury
      */}
            <UiloraLiquidChrome
                baseColor="#050505"
                chromeColor="#f0f0f0"
                viscosity={0.3}
                speed={0.4}
                distortion={0.7}
            />

            {/* Hero Overlay */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <h1 className="text-black/40 text-8xl md:text-[14rem] font-bold tracking-tighter leading-none italic mix-blend-exclusion">
                    CHROME<span className="text-black/20 not-italic">.</span>
                </h1>

                <div className="mt-16 flex flex-col items-center gap-6">
                    <p className="text-black/40 text-xs font-light tracking-[0.6em] uppercase max-w-lg leading-loose">
                        A study of molten silver and high-reflectance surfaces.
                        Disturb the pool to reveal the grain.
                    </p>
                </div>
            </div>

            <div className="absolute bottom-12 right-12 text-right">
                <button className="px-10 py-3 border border-white/10 text-white/40 text-[9px] tracking-[0.5em] uppercase hover:border-white hover:text-white transition-all duration-700">
                    Enter Simulation
                </button>
            </div>

            {/* Decorative Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
        </main>
    );
}
