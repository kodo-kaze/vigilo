import React from "react";
import { LiquidGlassCard, LiquidPill } from "@/src/components/ui";
import { TelemetryStats } from "./types";
import TelemetryMetricTile from "./TelemetryMetricTile";

export interface CrowdDynamicsCardProps {
  stats: TelemetryStats;
  isAlert: boolean;
  probabilityPercent: number;
  className?: string;
}

/**
 * CrowdDynamicsCard
 *
 * 8-column wide bento card presenting real-time crowd dynamics telemetry,
 * crowd surge probability progress gauge, and 4 neural metrics.
 */
export default function CrowdDynamicsCard({
  stats,
  isAlert,
  probabilityPercent,
  className = "",
}: CrowdDynamicsCardProps) {
  return (
    <LiquidGlassCard
      hasTopSpecular={false}
      className={`lg:col-span-8 rounded-xl border-white/[0.08] p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header (Clean, steady indicator, aesthetic typography) */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-white/95 font-sans">
              Crowd Dynamics &amp; Flow Telemetry
            </h2>
          </div>
          <LiquidPill size="xs" className="text-[10px] text-white/70">
            Real-Time Inference
          </LiquidPill>
        </div>

        {/* Crowd Probability Progress Gauge (Clean integrated section) */}
        <div className="mb-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between font-sans">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/70">
                Crowd Surge Probability
              </span>
              <span className="text-[11px] text-white/30">•</span>
              <span className="text-[11px] font-medium text-white/50 hidden sm:inline">
                {probabilityPercent < 50
                  ? "Sparse Flow"
                  : probabilityPercent < 80
                  ? "Elevated Density"
                  : "Surge Threshold"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-semibold tracking-tight font-sans ${
                  isAlert ? "text-rose-400" : "text-white/95"
                }`}
              >
                {probabilityPercent}%
              </span>
            </div>
          </div>

          {/* Gauge Bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAlert
                  ? "bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                  : "bg-gradient-to-r from-white/30 via-white/70 to-white"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, probabilityPercent))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-sans text-white/40">
            <span>0% (Safe Sparse)</span>
            <span>50% (Surge Threshold)</span>
            <span>100% (Dense Bottleneck)</span>
          </div>
        </div>

        {/* 4 Metric Columns in 1 Unified Strip with Vertical Dividers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] mb-3">
          {/* Metric 1: People Count */}
          <TelemetryMetricTile
            label="Detected People"
            value={stats.people_count}
            unit="pedestrians"
            subtitle="Instant Bounding Count"
          />

          {/* Metric 2: Spatial Density */}
          <TelemetryMetricTile
            label="Spatial Density"
            value={stats.density_per_megapixel.toFixed(1)}
            unit="/ MP"
            subtitle="Area Saturation Index"
          />

          {/* Metric 3: NN Proximity */}
          <TelemetryMetricTile
            label="NN Proximity"
            value={stats.nearest_neighbor_distance.toFixed(3)}
            subtitle="Cluster Tightness Ratio"
          />

          {/* Metric 4: Inference FPS */}
          <TelemetryMetricTile
            label="Inference Speed"
            value={stats.fps.toFixed(1)}
            unit="fps"
            subtitle="Neural Engine Speed"
          />
        </div>
      </div>

      {/* Bottom Footnote (Clean sans-serif) */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-sans text-white/40">
        <span>Telemetry Ingestion: Active (0.45s loop)</span>
        <span className="hidden sm:inline">
          Classification: Random Forest Temporal Smoothing
        </span>
      </div>
    </LiquidGlassCard>
  );
}
