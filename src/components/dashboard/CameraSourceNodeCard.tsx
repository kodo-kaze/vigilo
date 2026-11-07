"use client";

import React from "react";
import { LiquidGlassCard, LiquidPill } from "@/src/components/ui";

export interface CameraSourceNodeCardProps {
  name: string;
  description?: string;
  badge?: string;
  deviceType?: "webcam" | "cctv" | "network";
  isCurrent?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * CameraSourceNodeCard
 *
 * Professional, tactile liquid glass card for selecting optical sensors,
 * webcams, and pre-configured facility CCTV nodes.
 */
export default function CameraSourceNodeCard({
  name,
  description,
  badge,
  deviceType = "webcam",
  isCurrent = false,
  isLoading = false,
  disabled = false,
  onSelect,
  className = "",
}: CameraSourceNodeCardProps) {
  return (
    <LiquidGlassCard
      hasTopSpecular={true}
      onClick={() => {
        if (!isCurrent && !disabled && !isLoading) {
          onSelect();
        }
      }}
      className={`group relative p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-3.5 transition-all duration-300 select-none cursor-pointer ${
        isCurrent
          ? "border-emerald-500/40 bg-emerald-950/25 shadow-[0_0_24px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/30"
          : "border-white/[0.08] bg-white/[0.02] hover:border-cyan-400/40 hover:bg-white/[0.045] hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Left Optical Sensor Aperture Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
            isCurrent
              ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              : "border-white/[0.08] bg-white/[0.03] text-white/50 group-hover:border-cyan-400/40 group-hover:text-cyan-300 group-hover:bg-cyan-950/30"
          }`}
        >
          {deviceType === "webcam" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* Center Metadata Column */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-[13px] font-medium text-white/95 font-sans tracking-tight truncate group-hover:text-cyan-300 transition-colors">
              {name}
            </h4>
            {badge && (
              <LiquidPill
                size="xs"
                variant={isCurrent ? "cyan" : "default"}
                textClassName="text-[9.5px] font-mono tracking-normal"
              >
                {badge}
              </LiquidPill>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-white/45 font-sans mt-0.5 truncate leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right Action / Status Area */}
      <div className="shrink-0 flex items-center">
        {isCurrent ? (
          <LiquidPill
            size="xs"
            variant="success"
            icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            textClassName="text-[10px] font-mono font-semibold"
          >
            ACTIVE
          </LiquidPill>
        ) : (
          <button
            type="button"
            disabled={disabled || isLoading}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-sans font-medium text-white/70 group-hover:border-cyan-400/40 group-hover:bg-cyan-950/40 group-hover:text-cyan-300 transition-all duration-200 flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="h-2 w-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Select</span>
                <span className="text-white/40 group-hover:text-cyan-400 transition-colors">→</span>
              </>
            )}
          </button>
        )}
      </div>
    </LiquidGlassCard>
  );
}
