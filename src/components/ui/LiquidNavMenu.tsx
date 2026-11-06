"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface LiquidNavMenuProps {
  isPaused?: boolean;
  onTogglePlayPause?: () => void;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export default function LiquidNavMenu({
  isPaused = true,
  onTogglePlayPause,
  position = "bottom-right",
}: LiquidNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    "bottom-right": "bottom-7 right-7 items-end",
    "bottom-left": "bottom-7 left-7 items-start",
    "bottom-center": "bottom-7 left-1/2 -translate-x-1/2 items-center",
  }[position];

  const originClass = {
    "bottom-right": "origin-bottom-right",
    "bottom-left": "origin-bottom-left",
    "bottom-center": "origin-bottom",
  }[position];

  // Navigation and action items (all pure rounded-full capsule pills)
  const menuItems = [
    {
      id: "toggle-animation",
      label: isPaused ? "Play Molten Flow" : "Pause Molten Flow",
      subLabel: isPaused ? "Resume liquid surface" : "Freeze liquid surface",
      badge: isPaused ? "Paused" : "Live",
      badgeColor: isPaused
        ? "border-amber-400/40 bg-amber-950/60 text-amber-300"
        : "border-emerald-400/40 bg-emerald-950/60 text-emerald-300",
      isAction: true,
      onClick: () => {
        onTogglePlayPause?.();
      },
      icon: isPaused ? (
        <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      ),
    },
    {
      id: "home",
      label: "Main Landing",
      subLabel: "Vigilo front portal",
      href: "/",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "about",
      label: "About Vigilo",
      subLabel: "System overview & mission",
      href: "/about",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    {
      id: "intelligence",
      label: "Crowd Intelligence",
      subLabel: "Density heatmaps & velocity",
      href: "#",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "forecast",
      label: "Bottleneck Forecast",
      subLabel: "15–30 min surge pre-emption",
      href: "#",
      badge: "Conflux AI",
      badgeColor: "border-cyan-400/40 bg-cyan-950/60 text-cyan-300",
      icon: (
        <svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "cctv",
      label: "Camera Streams",
      subLabel: "RTSP & ONVIF mesh feeds",
      href: "#",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      id: "dispatch",
      label: "Incident Dispatch",
      subLabel: "Dynamic signs & marshal feeds",
      href: "#",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "topology",
      label: "Facility Topology",
      subLabel: "Station concourse mapping",
      href: "#",
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Dimmed backdrop blur overlay when open */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[6px] transition-all duration-400 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Floating Speed Dial Container */}
      <div
        ref={menuRef}
        className={`fixed z-50 flex flex-col ${positionClasses}`}
      >
        {/* Animated Staggered Menu Items */}
        <div className="flex flex-col gap-2.5 mb-3 pointer-events-none">
          {menuItems.map((item, index) => {
            // Reverse index calculation for bottom-to-top cascading stagger
            const reverseIndex = menuItems.length - 1 - index;
            const staggerDelay = isOpen ? `${reverseIndex * 32}ms` : `${index * 18}ms`;

            const itemContent = (
              <>
                {/* Left Icon (Smoothly embedded without boxy frames) */}
                <span className="relative z-10 flex items-center justify-center text-white/90 shrink-0">
                  {item.icon}
                </span>

                {/* Text Labels */}
                <span className="relative z-10 flex flex-col items-start pr-2">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-medium tracking-wider uppercase ${
                          item.badgeColor || "border-cyan-400/40 bg-cyan-950/60 text-cyan-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {item.subLabel && (
                    <span className="text-[10px] text-gray-400 font-normal tracking-wide group-hover:text-gray-300">
                      {item.subLabel}
                    </span>
                  )}
                </span>

                {/* Subtle right chevron */}
                <svg
                  className="relative z-10 ml-auto h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            );

            return (
              <div
                key={item.id}
                style={{
                  transitionDelay: staggerDelay,
                  transitionDuration: isOpen ? "400ms" : "240ms",
                  transitionTimingFunction: isOpen
                    ? "cubic-bezier(0.16, 1, 0.3, 1)"
                    : "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className={`transform-gpu transition-all ${originClass} ${
                  isOpen
                    ? "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto"
                    : "opacity-0 translate-y-7 scale-[0.92] blur-[3px] pointer-events-none"
                }`}
              >
                {item.isAction ? (
                  <button
                    onClick={() => {
                      item.onClick?.();
                    }}
                    className="liquid-glass-btn group flex w-full items-center gap-3.5 overflow-hidden rounded-full px-5 py-3 text-left select-none transition-all duration-300 hover:scale-[1.025] hover:bg-white/[0.08] active:scale-[0.985]"
                  >
                    {itemContent}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className="liquid-glass-btn group flex items-center gap-3.5 overflow-hidden rounded-full px-5 py-3 text-left select-none transition-all duration-300 hover:scale-[1.025] hover:bg-white/[0.08] active:scale-[0.985]"
                  >
                    {itemContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Floating Trigger Button (Circular Liquid Glass) */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open navigation menu"}
          title={isOpen ? "Close menu" : "Navigation & Controls"}
          className={`liquid-glass-btn group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-white transition-all duration-400 hover:scale-105 active:scale-95 ${
            isOpen ? "ring-2 ring-white/35 bg-white/[0.12]" : ""
          }`}
        >
          {/* Top specular reflection arc */}
          <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[38%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent opacity-80" />

          {/* Morphing + into × icon with buoyant 135deg rotation */}
          <div
            className="relative flex h-6 w-6 items-center justify-center transition-transform duration-500"
            style={{
              transform: isOpen ? "rotate(135deg)" : "rotate(0deg)",
              transitionTimingFunction: "cubic-bezier(0.34, 1.25, 0.64, 1)",
            }}
          >
            {/* Horizontal line */}
            <span className="absolute h-0.5 w-5 rounded-full bg-white transition-colors duration-200" />
            {/* Vertical line */}
            <span className="absolute h-5 w-0.5 rounded-full bg-white transition-colors duration-200" />
          </div>
        </button>
      </div>
    </>
  );
}
