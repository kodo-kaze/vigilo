import React from "react";
import { LiquidGlassCard } from "@/src/components/ui";
import { TelemetryStats } from "./types";

export interface CameraDetailsCardProps {
  stats: TelemetryStats;
  formatUptime: (seconds: number) => string;
  className?: string;
}

/**
 * CameraDetailsCard
 *
 * 4-column rectangular bento card displaying optical hardware specs,
 * facility zone configuration, capture rate, and AI pipeline status.
 */
export default function CameraDetailsCard({
  stats,
  formatUptime,
  className = "",
}: CameraDetailsCardProps) {
  return (
    <LiquidGlassCard
      hasTopSpecular={false}
      className={`lg:col-span-4 rounded-xl border-white/[0.08] p-2.5 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
              Location &amp; Camera Details
            </h2>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
            Node Config
          </span>
        </div>

        {/* 2-Column Bento Specs Grid */}
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
          {/* Active Camera Device */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              OPTICAL SENSOR
            </span>
            <span
              className="font-medium text-white truncate text-[10px]"
              title={stats.camera_source}
            >
              {stats.camera_source || "Integrated (0)"}
            </span>
          </div>

          {/* Facility Location / Zone */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              ZONE / FACILITY
            </span>
            <span className="font-medium text-cyan-300 truncate text-[10px]">
              {stats.zone?.split("•")[0]?.trim() || "Terminal 04"}
            </span>
          </div>

          {/* Resolution & Ingestion FPS */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              CAPTURE
            </span>
            <span className="font-medium text-white text-[10px]">
              {stats.resolution || "1280x720"} @ {stats.capture_fps || 30}
            </span>
          </div>

          {/* Protocol & Ingestion */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              STREAM PROTOCOL
            </span>
            <span className="font-medium text-white/90 text-[10px]">
              MJPEG Zero-latency
            </span>
          </div>

          {/* AI Model Pipeline */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              AI PIPELINE
            </span>
            <span className="font-medium text-white/90 text-[10px]">
              YOLO26m + RF-21
            </span>
          </div>

          {/* Operational Uptime */}
          <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
            <span className="text-white/45 text-[8.5px] uppercase truncate">
              SYSTEM UPTIME
            </span>
            <span className="font-medium text-emerald-400 text-[10px]">
              {formatUptime(stats.uptime_seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions / Status Footer */}
      <div className="pt-1.5 mt-2 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Driver: AVFoundation
        </span>
        <span>Mesh Sync: Nominal</span>
      </div>
    </LiquidGlassCard>
  );
}
