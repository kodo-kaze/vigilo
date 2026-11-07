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
            {/* Standby Pulse Icon */}
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-40" />
              <div className="absolute inset-2 rounded-full border border-amber-400/30" />
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <svg
                className="h-5 w-5 text-amber-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824-2.179a5 5 0 014.243 1.414M3 3l18 18"
                />
              </svg>
            </div>

            <h3 className="text-sm sm:text-base font-semibold tracking-wide text-white">
              Surveillance Suspended (Compute Engine Idle)
            </h3>
            <p className="mt-1 max-w-md text-[11px] sm:text-xs text-gray-400 leading-relaxed font-sans">
              Camera hardware device is released and the neural inference pipeline
              is paused to eliminate compute and power usage.
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-3">
              <LiquidGlassButton
                onClick={onTogglePower}
                disabled={isPowerToggling}
                size="sm"
                className="font-sans text-xs tracking-tight"
                iconLeft={
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                }
              >
                {isPowerToggling ? "INITIALIZING SENSOR..." : "TURN ON CAMERA & INFERENCE"}
              </LiquidGlassButton>

              {onOpenSourceModal && (
                <button
                  type="button"
                  onClick={onOpenSourceModal}
                  className="pointer-events-auto flex items-center gap-2 text-xs font-sans text-white/70 hover:text-white transition-colors py-1.5 px-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20"
                >
                  <svg
                    className="h-3.5 w-3.5 text-white/50"
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
                  <span>Switch Camera Source ↗</span>
                </button>
              )}

              {onToggleAutoStart && (
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto flex items-center gap-2 cursor-pointer text-xs font-sans text-white/50 hover:text-white/80 select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={autoStartCamera}
                    onChange={onToggleAutoStart}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-black/60 text-white focus:ring-0 cursor-pointer accent-white"
                  />
                  <span>Remember to auto-start camera when opening dashboard</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Offline / Connecting State Overlay (Only when not suspended) */}
        {!isSuspended && streamError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-black/35 backdrop-blur-md">
            {/* Radar Grid Animation */}
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
              <div className="absolute inset-4 rounded-full border border-white/20" />
              <svg
                className="h-5 w-5 text-cyan-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-sm sm:text-base font-semibold tracking-wide text-white">
              Camera Feed Offline or Initializing
            </h3>
            <p className="mt-1 max-w-md text-[11px] sm:text-xs text-gray-400 leading-relaxed font-sans">
              The AI stream server is waiting for optical ingestion. Ensure the backend
              is running on{" "}
              <code className="text-cyan-300 font-mono text-[10px]">
                {backendUrl}
              </code>{" "}
              with your camera enabled.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <LiquidGlassButton
                onClick={onRetry}
                size="sm"
                className="font-mono text-[10px] tracking-wider"
                iconLeft={
                  <svg
                    className="h-3 w-3 text-cyan-400"
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
                RETRY FEED CONNECTION
              </LiquidGlassButton>

              {onOpenSourceModal && (
                <LiquidGlassButton
                  onClick={onOpenSourceModal}
                  size="sm"
                  className="font-mono text-[10px] tracking-wider border-cyan-400/40 text-cyan-300"
                  iconLeft={
                    <svg
                      className="h-3 w-3 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  }
                >
                  SWITCH CAMERA / IP PORT ↗
                </LiquidGlassButton>
              )}

              <LiquidGlassButton
                href="https://github.com/kodo-kaze/pedestrian-crowd-detection-models"
                size="sm"
                external
                className="font-mono text-[10px] text-white/60"
              >
                API Docs ↗
              </LiquidGlassButton>
            </div>
          </div>
        )}

        {/* Top-Left Floating Overlay HUD */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
          {/* Status Pill (Crisp visible liquid glass boundary) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)] text-xs font-sans select-none">
            <span
              className={`h-2 w-2 rounded-full ${
                isSuspended
                  ? "bg-amber-400"
                  : streamConnected
                  ? isAlert
                    ? "bg-red-400 animate-ping"
                    : "bg-emerald-400 animate-pulse"
                  : "bg-amber-400/80"
              }`}
            />
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
          </div>

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

        {/* Top-Right Floating Overlay HUD (Crisp visible liquid glass boundary) */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex items-center gap-2 select-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)] text-xs font-sans select-none">
            <span className="text-white/60">{stats.resolution || (isSuspended ? "Ready" : "1280×720")}</span>
            <span className="text-white/25 select-none">•</span>
            <span className="font-medium text-white/90">
              {isSuspended ? "Standby" : stats.capture_fps ? `${stats.capture_fps} FPS` : "Live Feed"}
            </span>
          </div>
        </div>

        {/* Bottom-Left Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/50 px-2.5 py-1 backdrop-blur-xl text-[11px] font-sans text-white/70 shadow-sm">
            <span className="text-white/40">Zone:</span>
            <span>{stats.zone?.split("•")[0]?.trim() || "Main Zone"}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/50 px-2.5 py-1 backdrop-blur-xl text-[11px] font-sans text-white/70 shadow-sm">
            <span>{stats.status}</span>
          </div>
        </div>

        {/* Bottom-Right Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 select-none">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/50 px-2.5 py-1 backdrop-blur-xl text-[11px] font-mono text-white/70 shadow-sm">
            <span>FPS: {isSuspended ? "0.0" : stats.fps.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
