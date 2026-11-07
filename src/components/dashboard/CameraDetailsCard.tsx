import React from "react";
import { LiquidGlassCard, LiquidGlassButton, LiquidPill } from "@/src/components/ui";
import { TelemetryStats } from "./types";

export interface CameraDetailsCardProps {
  stats: TelemetryStats;
  formatUptime: (seconds: number) => string;
  onTogglePower?: () => void;
  isPowerToggling?: boolean;
  autoStartCamera?: boolean;
  onToggleAutoStart?: () => void;
  onOpenSourceModal?: () => void;
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
  onTogglePower,
  isPowerToggling = false,
  autoStartCamera = false,
  onToggleAutoStart,
  onOpenSourceModal,
  className = "",
}: CameraDetailsCardProps) {
  const isSuspended = Boolean(stats.is_suspended || stats.status === "SUSPENDED");

  return (
    <LiquidGlassCard
      hasTopSpecular={false}
      className={`lg:col-span-4 rounded-xl border-white/[0.08] p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header (Clean, steady indicator, aesthetic typography) */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isSuspended ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-white/95 font-sans">
              Location &amp; Camera Details
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSourceModal && (
              <LiquidGlassButton
                onClick={onOpenSourceModal}
                size="sm"
                variant="subtle"
                className="!px-3 !py-1 text-[11px] font-sans font-medium !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
                iconRight={<span className="text-[10px] text-white/60">↗</span>}
                title="Switch optical camera node or configure IP & Port"
              >
                Switch Node
              </LiquidGlassButton>
            )}
            <LiquidPill
              size="xs"
              dotColor={isSuspended ? "bg-amber-400" : "bg-emerald-400"}
              className="hidden sm:inline-flex text-[10px] text-white/70"
            >
              {isSuspended ? "Standby" : "Active"}
            </LiquidPill>
          </div>
        </div>

        {/* 2-Column Bento Specs Grid (Unified clean container, no crowded separate boxes) */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 mb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-sans">
            {/* 1. Optical Sensor */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/45">
                  Optical Sensor
                </span>
                {onOpenSourceModal && (
                  <button
                    type="button"
                    onClick={onOpenSourceModal}
                    className="text-[10px] font-sans font-medium text-white/60 hover:text-white transition-colors hover:underline"
                    title="Configure Camera IP & Port"
                  >
                    Change
                  </button>
                )}
              </div>
              <span
                className="mt-0.5 text-xs font-medium text-white/90 truncate"
                title={stats.camera_source}
              >
                {isSuspended
                  ? "Powered Off (Idle)"
                  : stats.camera_ip
                  ? `${stats.camera_ip}:${stats.camera_port}`
                  : stats.camera_source || "Integrated (0)"}
              </span>
            </div>

            {/* 2. Facility Location / Zone */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-medium text-white/45">
                Zone / Facility
              </span>
              <span className="mt-0.5 text-xs font-medium text-white/90 truncate">
                {stats.zone?.split("•")[0]?.trim() || "Terminal Concourse 04"}
              </span>
            </div>

            {/* 3. Resolution & Capture Rate */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-medium text-white/45">
                Capture Rate
              </span>
              <span className="mt-0.5 text-xs font-medium text-white/90 truncate">
                {isSuspended
                  ? "Standby @ 0 FPS"
                  : `${stats.resolution || "1280×720"} @ ${stats.capture_fps || 30} FPS`}
              </span>
            </div>

            {/* 4. Stream Protocol */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-medium text-white/45">
                Stream Protocol
              </span>
              <span className="mt-0.5 text-xs font-medium text-white/90 truncate">
                {isSuspended
                  ? "Standby / Suspended"
                  : stats.camera_ip
                  ? `RTSP (${stats.camera_ip})`
                  : "MJPEG Zero-latency"}
              </span>
            </div>

            {/* 5. AI Vision Pipeline */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-medium text-white/45">
                AI Vision Pipeline
              </span>
              <span className="mt-0.5 text-xs font-medium text-white/90 truncate">
                {isSuspended ? "Suspended (0% Compute)" : "YOLO26m + RF-21"}
              </span>
            </div>

            {/* 6. System Uptime */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-medium text-white/45">
                System Uptime
              </span>
              <span className="mt-0.5 text-xs font-mono font-medium text-white/90 truncate">
                {formatUptime(stats.uptime_seconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Status Footer (Steady dot, clean font-sans) */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-sans text-white/60">
        <span className="flex items-center gap-1.5 truncate">
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              isSuspended ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className="truncate">
            {isSuspended ? "Engine: Standby (Idle)" : "Engine: Nominal (Active)"}
          </span>
        </span>
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleAutoStart && (
            <button
              type="button"
              onClick={onToggleAutoStart}
              title="Remember to auto-start camera directly on dashboard visit"
              className="text-[10px] font-sans text-white/50 hover:text-white transition-colors"
            >
              Auto-Start:{" "}
              <span
                className={`font-medium ${
                  autoStartCamera ? "text-white" : "text-white/40"
                }`}
              >
                {autoStartCamera ? "ON" : "OFF"}
              </span>
            </button>
          )}
          {onTogglePower && (
            <LiquidGlassButton
              onClick={onTogglePower}
              disabled={isPowerToggling}
              size="sm"
              variant={isSuspended ? "default" : "subtle"}
              className="!px-3 !py-1 text-[11px] font-sans font-medium !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
              iconRight={<span className="text-[10px] text-white/60">↗</span>}
              title={isSuspended ? "Turn on camera hardware sensor" : "Suspend camera to save power"}
            >
              {isSuspended ? "Turn On Camera" : "Turn Off Camera"}
            </LiquidGlassButton>
          )}
        </div>
      </div>
    </LiquidGlassCard>
  );
}
