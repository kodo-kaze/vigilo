import React from "react";
import {
  LiquidGlassCard,
  LiquidGlassButton,
  LiquidPill,
} from "@/src/components/ui";
import { TelemetryStats } from "./types";

export interface DashboardVideoFeedProps {
  backendUrl: string;
  stats: TelemetryStats;
  streamConnected: boolean;
  streamError: boolean;
  streamKey: number;
  isAlert: boolean;
  onRetry: () => void;
  onStreamLoad: () => void;
  onStreamError: () => void;
  onTogglePower?: () => void;
  isPowerToggling?: boolean;
  autoStartCamera?: boolean;
  onToggleAutoStart?: () => void;
  onOpenSourceModal?: () => void;
  onToggleHeatmap?: () => void;
  onToggleClusters?: () => void;
  className?: string;
}

/**
 * DashboardVideoFeed
 *
 * Full-screen live video monitor display wrapped in translucent liquid glass.
 * Features live MJPEG stream ingestion, animated radar offline fallback,
 * power-saving suspension overlay, and floating HUD telemetry overlay pills.
 */
export default function DashboardVideoFeed({
  backendUrl,
  stats,
  streamConnected,
  streamError,
  streamKey,
  isAlert,
  onRetry,
  onStreamLoad,
  onStreamError,
  onTogglePower,
  isPowerToggling = false,
  autoStartCamera = false,
  onToggleAutoStart,
  onOpenSourceModal,
  onToggleHeatmap,
  onToggleClusters,
  className = "",
}: DashboardVideoFeedProps) {
  const isSuspended = Boolean(stats.is_suspended || stats.status === "SUSPENDED");

  return (
    <LiquidGlassCard
      hasTopSpecular={false}
      className={`w-full flex-1 min-h-0 p-0 rounded-xl sm:rounded-2xl border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden ${className}`}
    >
      {/* Video Player Display Area */}
      <div className="relative w-full h-full min-h-[200px] bg-black/20 flex items-center justify-center overflow-hidden">
        {/* The Live MJPEG Stream (Hidden when suspended) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={streamKey}
          src={`${backendUrl}/video_feed`}
          alt=""
          className={`h-full w-full object-contain transition-opacity duration-300 select-none pointer-events-none ${
            streamConnected && !streamError && !isSuspended
              ? "opacity-100"
              : "opacity-0 hidden"
          }`}
          onLoad={onStreamLoad}
          onError={onStreamError}
        />

        {/* Suspended State Overlay (Hardware released, CPU/GPU at 0%) */}
        {isSuspended && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-black/45 backdrop-blur-md select-none">
            {/* Professional Vigilo Standby Emblem */}
            <div className="relative mb-3.5 flex items-center justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_12px_32px_rgba(0,0,0,0.6)] p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Vigilo"
                  className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                />
              </div>
            </div>

            <h3 className="text-base font-semibold tracking-tight text-white/95 font-sans">
              Camera Standby
            </h3>
            <p className="mt-1 max-w-sm text-xs text-white/55 leading-relaxed font-sans">
              Optical sensor is paused in power-saving standby mode. Turn on camera to resume real-time surveillance.
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-3">
              <LiquidGlassButton
                onClick={onTogglePower}
                disabled={isPowerToggling}
                size="sm"
                className="font-sans text-xs font-medium !px-4 !py-2 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.5)]"
                iconLeft={
                  isPowerToggling ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <svg
                      className="h-3.5 w-3.5 text-white/85 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                      />
                    </svg>
                  )
                }
              >
                {isPowerToggling ? "Starting Camera..." : "Turn On Camera"}
              </LiquidGlassButton>

              {onOpenSourceModal && (
                <LiquidGlassButton
                  onClick={onOpenSourceModal}
                  size="sm"
                  variant="subtle"
                  className="pointer-events-auto text-xs font-sans font-medium !border-white/15 hover:!border-white/30"
                  iconLeft={
                    <svg
                      className="h-3.5 w-3.5 text-white/70 shrink-0"
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
                  }
                  iconRight={<span className="text-white/40 text-[10px]">↗</span>}
                >
                  Switch Camera Source
                </LiquidGlassButton>
              )}

              {onToggleAutoStart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAutoStart();
                  }}
                  className="pointer-events-auto flex items-center gap-2.5 cursor-pointer text-xs font-sans text-white/60 hover:text-white select-none transition-colors group"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      autoStartCamera
                        ? "border-white bg-white text-black shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                        : "border-white/30 bg-black/40 group-hover:border-white/50"
                    }`}
                  >
                    {autoStartCamera && (
                      <svg
                        className="h-2.5 w-2.5 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span>Remember to auto-start camera when opening dashboard</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Offline / Connecting State Overlay (Only when not suspended) */}
        {!isSuspended && streamError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-black/45 backdrop-blur-md select-none">
            {/* Professional Connection Emblem */}
            <div className="relative mb-3.5 flex items-center justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_12px_32px_rgba(0,0,0,0.6)] p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Vigilo"
                  className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] opacity-85"
                />
              </div>
            </div>

            <h3 className="text-base font-semibold tracking-tight text-white/95 font-sans">
              Connecting to Camera Stream
            </h3>
            <p className="mt-1 max-w-sm text-xs text-white/55 leading-relaxed font-sans">
              Waiting for live video ingestion from{" "}
              <code className="text-white/80 font-mono text-[11px] bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                {backendUrl}
              </code>
              . Verify camera feed is active.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <LiquidGlassButton
                onClick={onRetry}
                size="sm"
                className="font-sans text-xs font-medium !px-3.5 !py-1.5"
                iconLeft={
                  <svg
                    className="h-3.5 w-3.5 text-white/80 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
              >
                Retry Connection
              </LiquidGlassButton>

              {onOpenSourceModal && (
                <LiquidGlassButton
                  onClick={onOpenSourceModal}
                  size="sm"
                  variant="subtle"
                  className="font-sans text-xs font-medium !border-white/15 hover:!border-white/30"
                  iconLeft={
                    <svg
                      className="h-3.5 w-3.5 text-white/70 shrink-0"
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
                  }
                  iconRight={<span className="text-white/40 text-[10px]">↗</span>}
                >
                  Switch Camera Source
                </LiquidGlassButton>
              )}

              <LiquidGlassButton
                href="https://github.com/kodo-kaze/pedestrian-crowd-detection-models"
                size="sm"
                external
                variant="subtle"
                className="font-sans text-xs text-white/60 !border-white/10 hover:!border-white/25"
              >
                API Docs ↗
              </LiquidGlassButton>
            </div>
          </div>
        )}

        {/* Top-Left Floating Overlay HUD */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
          {/* Status Pill (LiquidPill) */}
          <LiquidPill
            size="md"
            dotColor={
              isSuspended
                ? "bg-amber-400"
                : streamConnected
                ? isAlert
                  ? "bg-red-400"
                  : "bg-emerald-400"
                : "bg-amber-400/80"
            }
            dotPulse={Boolean(streamConnected && isAlert)}
          >
            <span className="font-medium text-white/95">Live Video</span>
            <span className="text-white/25 select-none">•</span>
            <span className="text-[11px] font-normal text-white/60">
              {isSuspended
                ? "Standby"
                : streamConnected
                ? isAlert
                  ? "Surge Alert"
                  : "Active"
                : "Connecting"}
            </span>
          </LiquidPill>

          {/* Camera Node / Source Selector Quick Switch (LiquidGlassButton) */}
          {onOpenSourceModal && (
            <LiquidGlassButton
              onClick={onOpenSourceModal}
              size="sm"
              variant="subtle"
              className="pointer-events-auto !px-3.5 !py-1.5 text-xs font-sans font-medium !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
              iconLeft={
                <svg
                  className="h-3.5 w-3.5 text-white/70 shrink-0"
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
              }
              iconRight={<span className="text-white/40 text-[10px]">▾</span>}
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {stats.camera_ip
                  ? `${stats.camera_ip}:${stats.camera_port}`
                  : stats.camera_source?.split("(")[0]?.trim() || "Select Camera"}
              </span>
            </LiquidGlassButton>
          )}

          {/* Quick Camera On/Off Power Action (LiquidGlassButton) */}
          {onTogglePower && (
            <LiquidGlassButton
              onClick={onTogglePower}
              disabled={isPowerToggling}
              size="sm"
              variant={isSuspended ? "default" : "subtle"}
              className="pointer-events-auto !px-3.5 !py-1.5 text-xs font-sans font-medium shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.5)]"
              iconLeft={
                <svg
                  className="h-3.5 w-3.5 text-white/85"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 3v9"
                  />
                </svg>
              }
            >
              {isSuspended ? "Turn On" : "Turn Off"}
            </LiquidGlassButton>
          )}
        </div>

        {/* Top-Right Floating Overlay HUD (Controls & Resolution) */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex flex-wrap items-center justify-end gap-2 select-none">
          {/* Ground Heatmap Live Toggle */}
          {onToggleHeatmap && !isSuspended && (
            <LiquidGlassButton
              onClick={onToggleHeatmap}
              size="sm"
              variant={stats.heatmap_enabled !== false ? "default" : "subtle"}
              className="pointer-events-auto !px-3 !py-1 text-xs font-sans font-medium !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
              title="Toggle Ground Density Heatmap"
            >
              Heatmap: {stats.heatmap_enabled !== false ? "ON" : "OFF"}
            </LiquidGlassButton>
          )}

          {/* Spatial Clusters Live Toggle */}
          {onToggleClusters && !isSuspended && (
            <LiquidGlassButton
              onClick={onToggleClusters}
              size="sm"
              variant={stats.clusters_enabled !== false ? "default" : "subtle"}
              className="pointer-events-auto !px-3 !py-1 text-xs font-sans font-medium !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
              title="Toggle Density-Aware Cluster Polygons & Gatherings"
            >
              Clusters: {stats.clusters_enabled !== false ? "ON" : "OFF"}
            </LiquidGlassButton>
          )}

          <LiquidPill size="md">
            <span className="text-white/60">
              {stats.resolution || (isSuspended ? "Ready" : "1280×720")}
            </span>
            <span className="text-white/25 select-none">•</span>
            <span className="font-medium text-white/90">
              {isSuspended
                ? "Standby"
                : stats.capture_fps
                ? `${stats.capture_fps} FPS`
                : "Live Feed"}
            </span>
          </LiquidPill>
        </div>

        {/* Bottom-Left Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
          <LiquidPill size="xs" className="!px-3 !py-1 text-[11px] text-white/80">
            <span className="text-white/40">Zone:</span>
            <span>{stats.zone?.split("•")[0]?.trim() || "Main Zone"}</span>
          </LiquidPill>
          <LiquidPill size="xs" className="!px-3 !py-1 text-[11px] text-white/80">
            <span>{stats.status}</span>
          </LiquidPill>
          {(stats.dense_clusters_count ?? 0) > 0 && (
            <LiquidPill size="xs" dotColor="bg-rose-500" className="!px-3 !py-1 text-[11px] text-rose-300">
              <span>{stats.dense_clusters_count} Dense Zone{stats.dense_clusters_count! > 1 ? "s" : ""}</span>
            </LiquidPill>
          )}
          {(stats.gatherings_count ?? 0) > 0 && (
            <LiquidPill size="xs" dotColor="bg-sky-400" className="!px-3 !py-1 text-[11px] text-sky-300">
              <span>{stats.gatherings_count} Gathering{stats.gatherings_count! > 1 ? "s" : ""}</span>
            </LiquidPill>
          )}
        </div>

        {/* Bottom-Right Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 select-none">
          <LiquidPill size="xs" textClassName="font-mono text-white/80" className="!px-3 !py-1 text-[11px]">
            <span>FPS: {isSuspended ? "0.0" : stats.fps.toFixed(1)}</span>
          </LiquidPill>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
