"use client";

import React from "react";
import { LiquidGlassCard, LiquidPill } from "@/src/components/ui";

export interface CameraSourceNodeCardProps {
  name: string;
  description?: string;
  badgeLeft: React.ReactNode;
  badgeRight?: React.ReactNode;
  isCurrent?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  actionLabel?: string;
  onSelect: () => void;
  className?: string;
}

/**
 * CameraSourceNodeCard
 *
 * Reusable translucent liquid glass card for selecting optical hardware devices,
 * local webcams, and pre-configured RTSP/HTTP CCTV nodes.
 */
export default function CameraSourceNodeCard({
  name,
  description,
  badgeLeft,
  badgeRight,
  isCurrent = false,
  isLoading = false,
  disabled = false,
  actionLabel = "Switch to Node",
  onSelect,
  className = "",
}: CameraSourceNodeCardProps) {
  return (
    <LiquidGlassCard
      hasTopSpecular={true}
      className={`p-3.5 sm:p-4 rounded-xl flex flex-col justify-between gap-3 transition-all duration-300 group select-none ${
        isCurrent
          ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_24px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/30"
          : "border-white/[0.08] bg-white/[0.02] hover:border-cyan-400/40 hover:bg-white/[0.04] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      } ${className}`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {typeof badgeLeft === "string" ? (
            <LiquidPill size="xs" variant={isCurrent ? "cyan" : "default"}>
              {badgeLeft}
            </LiquidPill>
          ) : (
            badgeLeft
          )}

          {badgeRight && (
            <div>
              {typeof badgeRight === "string" ? (
                <LiquidPill
                  size="xs"
                  variant={isCurrent ? "success" : "default"}
                  textClassName={
                    isCurrent ? "text-emerald-300 font-semibold" : "text-white/40 uppercase"
                  }
                >
                  {badgeRight}
                </LiquidPill>
              ) : (
                badgeRight
              )}
            </div>
          )}
        </div>

        {/* Node Name */}
        <h4 className="text-xs font-mono font-medium text-white/95 group-hover:text-cyan-300 transition-colors">
          {name}
        </h4>

        {/* Description or Zone Location */}
        {description && (
          <p className="text-[10.5px] text-white/45 font-sans mt-1 leading-snug line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Action CTA Button */}
      <div className="pt-1.5">
        {isCurrent ? (
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 text-[10px] font-mono uppercase tracking-wider select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Currently Streaming</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            disabled={disabled || isLoading}
            className="w-full py-1.5 px-3 rounded-lg border border-white/[0.1] bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-white/80 hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="h-2 w-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <span>{actionLabel}</span>
            )}
          </button>
        )}
      </div>
    </LiquidGlassCard>
  );
}
