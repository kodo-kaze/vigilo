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
  className?: string;
}

/**
 * DashboardVideoFeed
 *
 * Full-screen live video monitor display wrapped in translucent liquid glass.
 * Features live MJPEG stream ingestion, animated radar offline fallback,
 * and floating HUD telemetry overlay pills.
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
  className = "",
}: DashboardVideoFeedProps) {
  return (
    <LiquidGlassCard
      hasTopSpecular={false}
      className={`w-full flex-1 min-h-0 p-0 rounded-xl sm:rounded-2xl border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden ${className}`}
    >
      {/* Video Player Display Area */}
      <div className="relative w-full h-full min-h-[200px] bg-black/20 flex items-center justify-center overflow-hidden">
        {/* The Live MJPEG Stream */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={streamKey}
          src={`${backendUrl}/video_feed`}
          alt=""
          className={`h-full w-full object-contain transition-opacity duration-300 select-none pointer-events-none ${
            streamConnected && !streamError ? "opacity-100" : "opacity-0 hidden"
          }`}
          onLoad={onStreamLoad}
          onError={onStreamError}
        />

        {/* Offline / Connecting State Overlay (Translucent Glass, Not Muddy Black) */}
        {streamError && (
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
          <LiquidPill size="sm" variant="default">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                streamConnected
                  ? isAlert
                    ? "bg-red-400 animate-ping"
                    : "bg-emerald-400 animate-pulse"
                  : "bg-amber-400/80"
              }`}
            />
            <span className="font-semibold uppercase tracking-wider text-white/90">
              Live Video Footage
            </span>
            <span className="text-white/20 select-none">/</span>
            <span className="text-cyan-300/90 text-[10px]">
              {streamConnected
                ? isAlert
                  ? "Surge Alert"
                  : "AI Active"
                : "Connecting"}
            </span>
          </LiquidPill>
        </div>

        {/* Top-Right Floating Overlay HUD */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex items-center gap-2 select-none">
          <LiquidPill size="sm" variant="default" className="text-white/70">
            <span className="text-white/50">{stats.resolution || "1280x720"}</span>
            <span className="text-white/20 select-none">•</span>
            <span className="text-emerald-400/90 font-medium">
              {stats.capture_fps ? `${stats.capture_fps} FPS` : "Live Ingestion"}
            </span>
          </LiquidPill>
        </div>

        {/* Bottom-Left Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
          <LiquidPill size="xs" variant="default" className="text-white/70">
            ZONE: {stats.zone?.split("•")[0]?.trim() || "ZONE 01"}
          </LiquidPill>
          <LiquidPill
            size="xs"
            variant={isAlert ? "alert" : "success"}
            className="font-medium"
          >
            {stats.status}
          </LiquidPill>
        </div>

        {/* Bottom-Right Floating Overlay HUD */}
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 select-none">
          <LiquidPill size="xs" variant="default" className="text-cyan-300/80">
            FPS: {stats.fps.toFixed(1)}
          </LiquidPill>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
