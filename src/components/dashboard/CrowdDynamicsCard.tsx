import React from "react";
import { LiquidGlassCard } from "@/src/components/ui";
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
      className={`lg:col-span-8 rounded-xl border-white/[0.08] p-2.5 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
              Crowd Dynamics &amp; Flow Telemetry
            </h2>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
            Real-Time Inference
          </span>
        </div>

        {/* Crowd Probability Progress Gauge (Slim Horizontal Strip) */}
        <div className="mb-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-white/70">Crowd Surge Probability</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/40 hidden sm:inline">
                {probabilityPercent < 50
                  ? "Sparse"
                  : probabilityPercent < 80
                  ? "Elevated"
                  : "Surge Threshold"}
              </span>
              <span
                className={`font-semibold text-xs sm:text-sm font-mono ${
                  isAlert ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {probabilityPercent}%
              </span>
            </div>
          </div>
          {/* Gauge Bar */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAlert
                  ? "bg-gradient-to-r from-amber-500 via-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                  : "bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, probabilityPercent))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/35">
            <span>0% (Safe Sparse)</span>
            <span>50% (Surge Threshold)</span>
            <span>100% (Dense Bottleneck)</span>
          </div>
        </div>

        {/* 4 Metric Tiles in 1 Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1.5">
          {/* Metric 1: People Count */}
          <TelemetryMetricTile
            label="Detected People"
            value={stats.people_count}
            unit="pedestrians"
            unitColor="text-cyan-400"
            subtitle="Instant Bounding Count"
          />

          {/* Metric 2: Spatial Density */}
          <TelemetryMetricTile
            label="Spatial Density"
            value={stats.density_per_megapixel.toFixed(1)}
            unit="/ MP"
            unitColor="text-white/60"
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
            label="Inference FPS"
            value={stats.fps.toFixed(1)}
            unit="fps"
            valueColor="text-cyan-300"
            unitColor="text-cyan-400"
            subtitle="Neural Engine Speed"
          />
        </div>
      </div>

      {/* Bottom footnote */}
      <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono text-white/40">
        <span>Telemetry Ingestion: Active (0.45s loop)</span>
        <span className="hidden sm:inline">
          Classification: Random Forest Temporal Smoothing
        </span>
      </div>
    </LiquidGlassCard>
  );
}
