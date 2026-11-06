"use client";

import React, { useState } from "react";
import Link from "next/link";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";
import LiquidNavMenu from "@/src/components/ui/LiquidNavMenu";
import LiquidGlassCard from "@/src/components/ui/LiquidGlassCard";

const TEAM = [
  {
    name: "Aditya Paul",
    username: "adityapaul26",
    role: "TEAM MEMBER",
    number: "01",
  },
  {
    name: "Ankita Biswas",
    username: "biswasankita2510-gif",
    role: "TEAM MEMBER",
    number: "02",
  },
  {
    name: "Anushka Das",
    username: "anushkadas-coder",
    role: "TEAM MEMBER",
    number: "03",
  },
  {
    name: "Archismita Maity",
    username: "Archi370",
    role: "TEAM MEMBER",
    number: "04",
  },
  {
    name: "Bratik Mukherjee",
    username: "Bimbok",
    role: "TEAM MEMBER",
    number: "05",
  },
];

export default function AboutPage() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* LIQUID CHROME BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <UiloraLiquidChrome
          baseColor="#020307"
          chromeColor="#d5dce7"
          viscosity={0.24}
          speed={0.18}
          distortion={0.62}
          isPaused={isPaused}
        />
      </div>

      {/* GLASS VIGNETTE */}
      {/* Sculpted silver reflections: adds defined liquid-metal ribbons over the shader */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none opacity-80 mix-blend-screen"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 38% 9% at 18% 24%, rgba(225,232,244,0.17) 0%, rgba(190,202,220,0.07) 34%, transparent 74%),
            radial-gradient(ellipse 34% 7% at 82% 39%, rgba(235,240,248,0.14) 0%, rgba(190,202,220,0.05) 38%, transparent 76%),
            radial-gradient(ellipse 42% 8% at 58% 76%, rgba(215,224,238,0.12) 0%, rgba(170,184,204,0.04) 40%, transparent 78%),
            linear-gradient(118deg, transparent 22%, rgba(220,228,240,0.045) 34%, transparent 43%),
            linear-gradient(164deg, transparent 52%, rgba(220,228,240,0.055) 59%, transparent 66%)
          `,
          filter: "blur(22px)",
        }}
      />

      {/* Deep graphite vignette keeps text and glass panels legible */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 38%, transparent 0%, rgba(2,3,7,0.20) 52%, rgba(2,3,7,0.78) 100%),
            linear-gradient(180deg, rgba(2,3,7,0.20) 0%, transparent 24%, rgba(2,3,7,0.18) 68%, rgba(2,3,7,0.88) 100%)
          `,
        }}
      />

      {/* Fine glass sheen; deliberately subtle so it doesn't look like fog */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[3] pointer-events-none opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.10) 48%, transparent 52%)",
          maskImage: "linear-gradient(to bottom, black, transparent 78%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* TOP NAVIGATION */}
        <header className="flex items-center justify-between border-b border-white/10 py-7">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl transition group-hover:scale-105">
              <span className="text-lg font-bold">V</span>
            </div>
            <span className="text-lg font-semibold tracking-[0.28em]">
              VIGILO<span className="text-white/60">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="liquid-glass-btn group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-mono tracking-widest text-white select-none transition-transform duration-300 hover:scale-105"
          >
            <span>BACK TO HOME</span>
            <svg
              className="h-3.5 w-3.5 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </header>

        {/* HERO SECTION */}
        <section className="relative isolate flex min-h-[570px] flex-col items-center justify-center py-28 text-center">
          {/* Local contrast layer: keeps the chrome visible while protecting hero text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 inset-y-8 z-0 rounded-[48px]"
            style={{
              background:
                "radial-gradient(ellipse 68% 72% at 50% 48%, rgba(2,4,8,0.88) 0%, rgba(2,4,8,0.72) 48%, rgba(2,4,8,0.22) 78%, transparent 100%)",
              filter: "blur(12px)",
            }}
          />

          <div className="relative z-10 mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#080b11]/85 px-5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/70 font-mono">
              Predictive Intelligence • Powered by AI
            </span>
          </div>

          <h1 className="relative z-10 text-6xl font-semibold tracking-[-0.07em] text-white drop-shadow-[0_5px_28px_rgba(0,0,0,0.8)] sm:text-8xl md:text-[110px]">
            About
            <span className="block bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text text-transparent drop-shadow-[0_5px_28px_rgba(0,0,0,0.85)]">
              VIGILO.
            </span>
          </h1>

          <p className="relative z-10 mt-8 max-w-2xl text-sm font-medium leading-8 text-white/90 [text-shadow:0_2px_14px_rgba(0,0,0,0.95)] sm:text-base">
            Understanding movement. Anticipating crowds. Building smarter spaces
            through predictive AI. We are making pedestrian crowd intelligence
            more insightful, proactive and accessible.
          </p>

          <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-4">
            <a
              href="#mission"
              className="liquid-glass-btn group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-xs font-semibold tracking-widest text-white select-none transition-transform duration-300 hover:scale-105 active:scale-95 border-white/30"
            >
              <span>DISCOVER VIGILO</span>
              <svg
                className="h-3.5 w-3.5 text-white/80 transition-transform duration-300 group-hover:translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>

            <a
              href="#team"
              className="liquid-glass-btn group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-xs font-semibold tracking-widest text-white select-none transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <span>MEET THE TEAM</span>
              <svg
                className="h-3.5 w-3.5 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="pointer-events-none absolute bottom-7 left-1/2 h-14 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </section>

        {/* MISSION SECTION */}
        <section id="mission" className="scroll-mt-20 py-20">
          <div className="mb-5 text-center text-[10px] tracking-[0.4em] text-white/60 font-mono">
            01 / OUR MISSION
          </div>

          <LiquidGlassCard className="mx-auto max-w-4xl p-8 sm:p-14">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-mono tracking-[0.25em] text-white/70 uppercase">
                Why We Built It
              </span>
            </div>

            <h2 className="text-3xl font-medium leading-tight tracking-tight sm:text-5xl text-white">
              Crowds move.{" "}
              <span className="text-white/60">
                We help you stay one step ahead.
              </span>
            </h2>

            <p className="mt-8 text-sm leading-8 text-white/80 sm:text-base">
              Vigilo is a Predictive AI Pedestrian Crowd Intelligence and Flow
              Management project. Our goal is to make understanding pedestrian
              movement easier and help anticipate crowd patterns before they
              become challenges.
            </p>

            <p className="mt-5 text-sm leading-8 text-white/80 sm:text-base">
              By bringing AI-driven intelligence into crowd analysis, Vigilo
              explores a smarter approach to understanding how people move
              through shared spaces and how pedestrian flow can be managed more
              effectively.
            </p>
          </LiquidGlassCard>
        </section>

        {/* TECHNOLOGY SECTION */}
        <section className="py-20">
          <div className="mb-5 text-center text-[10px] tracking-[0.4em] text-white/60 font-mono">
            02 / THE TECHNOLOGY
          </div>

          <h2 className="mb-12 text-center text-4xl font-semibold tracking-tight sm:text-6xl">
            Intelligence, <span className="text-white/60">reimagined.</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* AI MODEL CARD */}
            <LiquidGlassCard className="p-8 sm:p-10 transition duration-500 hover:-translate-y-1">
              <div className="relative">
                <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">
                  Core AI Technology
                </span>

                <div className="relative my-10 flex h-32 w-32 items-center justify-center">
                  {/* Ambient glow */}
                  <div className="absolute inset-2 rounded-full bg-white/20 blur-2xl animate-pulse" />

                  {/* Outer rotating ring */}
                  <div className="absolute inset-1 rounded-full border border-white/20 border-t-white/80 animate-[spin_12s_linear_infinite]" />

                  {/* Inner rotating ring */}
                  <div className="absolute inset-4 rounded-full border border-white/10 border-b-white/70 animate-[spin_8s_linear_infinite_reverse]" />

                  {/* Chrome orb */}
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-white via-[#9299a5] to-[#151515] shadow-[0_0_45px_rgba(255,255,255,0.22),inset_0_2px_12px_rgba(255,255,255,0.8)]">
                    <span className="text-3xl font-light text-[#171717]">
                      <svg
                        viewBox="0 0 48 48"
                        className="h-9 w-9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="Conflux AI emblem"
                      >
                        <path
                          d="M24 7V17M24 31V41M7 24H17M31 24H41"
                          stroke="#171717"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M24 17L31 24L24 31L17 24L24 17Z"
                          stroke="#171717"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <circle cx="24" cy="5" r="2.5" fill="#171717" />
                        <circle cx="24" cy="43" r="2.5" fill="#171717" />
                        <circle cx="5" cy="24" r="2.5" fill="#171717" />
                        <circle cx="43" cy="24" r="2.5" fill="#171717" />
                        <circle cx="24" cy="24" r="2" fill="#171717" />
                      </svg>
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-semibold tracking-tight text-white">
                  Conflux AI
                </h3>

                <p className="mt-5 text-sm leading-7 text-white/75 font-normal">
                  Vigilo uses the Conflux AI model as part of its intelligence
                  layer, bringing AI-powered capabilities into the project.
                </p>

                <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[10px] font-mono tracking-widest text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  POWERED BY CONFLUX
                </div>
              </div>
            </LiquidGlassCard>

            {/* VISION CARD */}
            <LiquidGlassCard className="p-8 sm:p-10 transition duration-500 hover:-translate-y-1">
              <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">
                Our Approach
              </span>

              <h3 className="mt-10 text-3xl font-semibold leading-tight text-white">
                From movement
                <br />
                to meaningful insight.
              </h3>

              <div className="mt-10 space-y-6">
                {[
                  [
                    "01",
                    "Understand",
                    "Explore pedestrian movement and crowd patterns.",
                  ],
                  [
                    "02",
                    "Anticipate",
                    "Use predictive intelligence to look ahead.",
                  ],
                  [
                    "03",
                    "Manage",
                    "Support smarter pedestrian flow management.",
                  ],
                ].map((item) => (
                  <div
                    key={item[0]}
                    className="flex gap-5 border-t border-white/10 pt-5"
                  >
                    <span className="text-xs font-mono text-white/40">{item[0]}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item[1]}</h4>
                      <p className="mt-1 text-xs leading-6 text-white/70 font-normal">
                        {item[2]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section id="team" className="scroll-mt-20 py-24">
          <div className="mb-5 text-center text-[10px] tracking-[0.4em] text-white/60 font-mono">
            03 / THE PEOPLE BEHIND VIGILO
          </div>

          <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-6xl text-white">
            Five minds. <span className="text-white/60">One vision.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-7 text-white/70">
            Built through collaboration, curiosity and a shared passion for
            technology. Meet the people behind Vigilo.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {TEAM.map((member) => (
              <LiquidGlassCard
                key={member.number}
                className="group flex flex-col items-center px-5 py-9 text-center transition duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <span className="absolute right-5 top-5 text-[10px] font-mono tracking-widest text-white/30">
                  {member.number}
                </span>

                {/* HEXAGON PROFILE IMAGE */}
                <div className="relative mb-7 h-28 w-28 transition duration-500 group-hover:scale-105">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-white/5"
                    style={{
                      clipPath:
                        "polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0% 50%)",
                    }}
                  />

                  <div
                    className="absolute inset-[3px] overflow-hidden bg-[#080a0e]"
                    style={{
                      clipPath:
                        "polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0% 50%)",
                    }}
                  >
                    {member.username ? (
                      <img
                        src={`https://github.com/${member.username}.png?size=300`}
                        alt={`${member.name} GitHub profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-white/30 font-mono">
                        {member.number}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white">{member.name}</h3>

                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/60 font-mono">
                  {member.role}
                </p>

                {member.username ? (
                  <a
                    href={`https://github.com/${member.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liquid-glass-btn mt-7 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-mono tracking-wider text-white select-none transition-transform duration-300 hover:scale-105"
                  >
                    <span>@{member.username}</span>
                    <svg
                      className="h-3 w-3 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>
                ) : (
                  <span className="mt-7 rounded-full border border-white/10 px-4 py-2 text-[10px] font-mono text-white/30">
                    GitHub profile
                  </span>
                )}
              </LiquidGlassCard>
            ))}
          </div>
        </section>

        {/* FINAL SECTION */}
        <section className="pb-28 pt-16">
          <LiquidGlassCard className="px-7 py-16 text-center sm:px-16">
            <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-white/[0.10] blur-[90px] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[10px] tracking-[0.4em] text-white/60 font-mono uppercase">
                The Future is Predictive
              </p>

              <h2 className="mt-7 text-4xl font-semibold tracking-tight sm:text-6xl text-white">
                Stay ahead.
                <span className="block text-white/40">Stay Vigilo.</span>
              </h2>

              <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/70">
                Better insights. Smarter decisions. A new perspective on
                pedestrian crowd intelligence.
              </p>

              <Link
                href="/"
                className="liquid-glass-btn group mt-10 inline-flex items-center gap-3 rounded-full px-9 py-4 text-xs font-semibold tracking-[0.2em] text-white select-none transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <span>EXPLORE VIGILO</span>
                <svg
                  className="h-4 w-4 text-white/90 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </LiquidGlassCard>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-center sm:flex-row sm:text-left">
          <span className="text-sm font-semibold tracking-[0.3em]">
            VIGILO<span className="text-white/30">.</span>
          </span>

          <p className="text-[10px] tracking-wider text-white/40 font-mono">
            BUILT WITH PURPOSE. POWERED BY INTELLIGENCE.
          </p>

          <Link
            href="/"
            className="text-xs text-white/50 transition hover:text-white flex items-center gap-1.5"
          >
            <span>Back to homepage</span>
            <span>↑</span>
          </Link>
        </footer>
      </div>

      {/* LIQUID GLASS CONTROL */}
      <LiquidNavMenu
        isPaused={isPaused}
        onTogglePlayPause={() => setIsPaused((prev) => !prev)}
        position="bottom-right"
      />
    </main>
  );
}
