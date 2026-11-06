"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface NavOption {
  id: string;
  label: string;
  subLabel?: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const DEFAULT_OPTIONS: NavOption[] = [
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
    id: "dashboard",
    label: "Live Dashboard",
    subLabel: "Molten flow simulation",
    href: "/dashboard",
    badge: "Engine",
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
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
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    id: "infrastructure",
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

interface LiquidNavMenuProps {
  options?: NavOption[];
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export default function LiquidNavMenu({
  options = DEFAULT_OPTIONS,
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

  return (
    <>
      {/* Dimmed backdrop blur overlay when open */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300 ${
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
          {options.map((item, index) => {
            // Reverse index calculation for bottom-to-top cascading stagger
            const reverseIndex = options.length - 1 - index;
            const staggerDelay = isOpen ? `${reverseIndex * 40}ms` : `${index * 25}ms`;

            return (
              <div
                key={item.id}
                style={{
                  transitionDelay: staggerDelay,
                  transitionDuration: isOpen ? "400ms" : "200ms",
                  transitionTimingFunction: isOpen
                    ? "cubic-bezier(0.34, 1.45, 0.64, 1)"
                    : "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className={`transform transition-all ${
                  isOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 translate-y-6 scale-75 pointer-events-none"
                }`}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="liquid-glass-btn group flex items-center gap-3.5 px-5 py-3 rounded-2xl text-left select-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-[1.03] active:scale-[0.98]"
                >
                  {/* Sheen reflection sweep */}
                  <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

                  {/* Icon Circle */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-colors group-hover:border-white/40 group-hover:bg-white/20">
                    {item.icon}
                  </div>

                  {/* Text labels */}
                  <div className="flex flex-col pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="rounded-full border border-cyan-400/40 bg-cyan-950/60 px-2 py-0.5 text-[9px] font-mono font-medium tracking-wider text-cyan-300 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subLabel && (
                      <span className="text-[10px] text-gray-400 font-light tracking-wide group-hover:text-gray-300">
                        {item.subLabel}
                      </span>
                    )}
                  </div>

                  {/* Subtle chevron arrow */}
                  <svg
                    className="ml-auto h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          title={isOpen ? "Close navigation" : "Explore Vigilo pages"}
          className="liquid-glass-btn group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Top specular reflection arc */}
          <span className="pointer-events-none absolute inset-x-2 top-0.5 h-[38%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent opacity-80" />

          {/* Shimmer sweep effect */}
          <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />

          {/* Morphing + into × icon */}
          <div
            className={`relative flex h-6 w-6 items-center justify-center transition-transform duration-300 ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
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
