"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  UiloraLiquidChrome,
  LiquidNavMenu,
  LiquidGlassCard,
  LiquidGlassButton,
} from "@/src/components/ui";

interface TelemetryStats {
  status: string;
  is_crowd: boolean;
  crowd_probability: number;
  people_count: number;
  density_per_megapixel: number;
  nearest_neighbor_distance: number;
  fps: number;
  capture_fps?: number;
  camera_connected: boolean;
  resolution?: string;
  camera_source?: string;
  zone?: string;
  model_mesh?: string;
  uptime_seconds: number;
}

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [isPaused, setIsPaused] = useState(false);
  const backendUrl = DEFAULT_BACKEND_URL;
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [stats, setStats] = useState<TelemetryStats>({
    status: "CONNECTING",
    is_crowd: false,
    crowd_probability: 0.0,
    people_count: 0,
    density_per_megapixel: 0.0,
    nearest_neighbor_distance: 0.0,
    fps: 0.0,
    capture_fps: 0.0,
    camera_connected: false,
    resolution: "Detecting...",
    camera_source: "Integrated Camera (Index 0)",
    zone: "Terminal Concourse 04 • Zone B",
    model_mesh: "YOLO26m + Conflux Random Forest",
    uptime_seconds: 0,
  });

  const [streamKey, setStreamKey] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll telemetry metrics from backend /stats
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch(`${DEFAULT_BACKEND_URL}/stats`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setStreamError(false);
        if (data.camera_connected) {
          setStreamConnected(true);
        }
      } else {
        setStreamConnected(false);
      }
    } catch {
      // Backend is unreachable or starting up
      setStreamConnected(false);
    }
  }, []);

  useEffect(() => {
    // Asynchronously trigger initial fetch without cascading render
    const initialTimer = setTimeout(() => {
      fetchTelemetry();
    }, 0);

    pollIntervalRef.current = setInterval(fetchTelemetry, 450);
    return () => {
      clearTimeout(initialTimer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchTelemetry]);

  // Restart stream image on retry
  const handleRetry = () => {
    setStreamError(false);
    setStreamKey((prev) => prev + 1);
    fetchTelemetry();
  };

  const isAlert = stats.is_crowd || stats.status === "CROWD ALERT";
  const probabilityPercent = Math.round(stats.crowd_probability * 100);

  // Format uptime into MM:SS or HH:MM:SS
  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
    }
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  return (
    <main className="relative h-screen max-h-screen w-full overflow-hidden bg-[#040508] text-white selection:bg-cyan-500/20 selection:text-white p-2.5 sm:p-3.5 lg:p-4 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Dynamic Molten Chrome Liquid Engine */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <UiloraLiquidChrome
          baseColor="#030408"
          chromeColor="#d4dce8"
          viscosity={0.28}
          speed={0.16}
          distortion={0.58}
          isPaused={isPaused}
        />
      </div>

      {/* Atmospheric Contrast Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(4,5,8,0.2)_0%,rgba(4,5,8,0.7)_65%,rgba(4,5,8,0.95)_100%)]"
      />

      {/* Main Glass Workspace Container (Wide Bento Frame, Zero-Scroll) */}
      <div className="relative z-10 mx-auto w-full max-w-[1640px] h-full flex flex-col justify-between gap-2.5 sm:gap-3">
        {/* =========================================================================
            TOP SECTION: LIVE VIDEO FOOTAGE (MAX HORIZONTAL SPACE, FLEX FILL)
            ========================================================================= */}
        <LiquidGlassCard
          hasTopSpecular={false}
          className="w-full flex-1 min-h-0 p-0 rounded-xl sm:rounded-2xl border-white/[0.08] bg-black/60 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
        >
          {/* Video Player Display Area */}
          <div className="relative w-full h-full min-h-[200px] bg-[#020306] flex items-center justify-center overflow-hidden">
            {/* The Live MJPEG Stream */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={streamKey}
              src={`${backendUrl}/video_feed`}
              alt=""
              className={`h-full w-full object-contain transition-opacity duration-300 select-none pointer-events-none ${
                streamConnected && !streamError ? "opacity-100" : "opacity-0 hidden"
              }`}
              onLoad={() => {
                setStreamError(false);
                setStreamConnected(true);
              }}
              onError={() => {
                setStreamError(true);
                setStreamConnected(false);
              }}
            />

            {/* Offline / Connecting State Overlay */}
            {streamError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-[#05070d]/90 backdrop-blur-md">
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
                  is running on <code className="text-cyan-300 font-mono text-[10px]">{backendUrl}</code> with
                  your camera enabled.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <LiquidGlassButton
                    onClick={handleRetry}
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
                    href={`${backendUrl}/docs`}
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
              <span className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-black/50 px-2.5 py-1 text-[10px] font-mono tracking-widest text-white/90 backdrop-blur-md">
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
              </span>
            </div>

            {/* Top-Right Floating Overlay HUD */}
            <div className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex items-center gap-2 select-none">
              <span className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-black/50 px-2.5 py-1 text-[10px] font-mono tracking-widest text-white/70 backdrop-blur-md">
                <span className="text-white/50">{stats.resolution || "1280x720"}</span>
                <span className="text-white/20 select-none">•</span>
                <span className="text-emerald-400/90 font-medium">
                  {stats.capture_fps ? `${stats.capture_fps} FPS` : "Live Ingestion"}
                </span>
              </span>
            </div>

            {/* Bottom-Left Floating Overlay HUD */}
            <div className="pointer-events-none absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 flex flex-wrap items-center gap-2 select-none">
              <span className="rounded-md border border-white/[0.08] bg-black/50 px-2 py-0.5 text-[10px] font-mono tracking-wider text-white/70 backdrop-blur-md">
                ZONE: {stats.zone?.split("•")[0]?.trim() || "ZONE 01"}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono tracking-wider backdrop-blur-md font-medium ${
                  isAlert
                    ? "border-red-500/25 bg-red-950/40 text-red-300"
                    : "border-emerald-500/25 bg-emerald-950/40 text-emerald-300"
                }`}
              >
                {stats.status}
              </span>
            </div>

            {/* Bottom-Right Floating Overlay HUD */}
            <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20 select-none">
              <span className="rounded-md border border-white/[0.08] bg-black/50 px-2 py-0.5 text-[10px] font-mono tracking-wider text-cyan-300/80 backdrop-blur-md">
                FPS: {stats.fps.toFixed(1)}
              </span>
            </div>
          </div>
        </LiquidGlassCard>

        {/* =========================================================================
            BOTTOM ROW: RECTANGULAR BENTO GRID (INSET SLIGHTLY LESSER WIDTH THAN VIDEO)
            ========================================================================= */}
        <section className="shrink-0 w-full max-w-[92%] sm:max-w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 select-none">
          {/* -----------------------------------------------------------------------
              BOTTOM-LEFT BENTO CARD: CROWD DYNAMICS (8 COLUMNS WIDE RECTANGLE)
              ----------------------------------------------------------------------- */}
          <LiquidGlassCard
            hasTopSpecular={false}
            className="lg:col-span-8 rounded-xl border-white/[0.08] bg-black/60 p-2.5 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
                    Crowd Dynamics & Flow Telemetry
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
                      {probabilityPercent < 50 ? "Sparse" : probabilityPercent < 80 ? "Elevated" : "Surge Threshold"}
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
                    style={{ width: `${Math.min(100, Math.max(0, probabilityPercent))}%` }}
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
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase truncate">
                    Detected People
                  </span>
                  <div className="my-0.5 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                      {stats.people_count}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400">pedestrians</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/35 truncate">
                    Instant Bounding Count
                  </span>
                </div>

                {/* Metric 2: Spatial Density */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase truncate">
                    Spatial Density
                  </span>
                  <div className="my-0.5 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                      {stats.density_per_megapixel.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-mono text-white/60">/ MP</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/35 truncate">
                    Area Saturation Index
                  </span>
                </div>

                {/* Metric 3: NN Proximity */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase truncate">
                    NN Proximity
                  </span>
                  <div className="my-0.5 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                      {stats.nearest_neighbor_distance.toFixed(3)}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-white/35 truncate">
                    Cluster Tightness Ratio
                  </span>
                </div>

                {/* Metric 4: Inference FPS */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase truncate">
                    Inference FPS
                  </span>
                  <div className="my-0.5 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-cyan-300">
                      {stats.fps.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400">fps</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/35 truncate">
                    Neural Engine Speed
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom footnote */}
            <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono text-white/40">
              <span>Telemetry Ingestion: Active (0.45s loop)</span>
              <span className="hidden sm:inline">Classification: Random Forest Temporal Smoothing</span>
            </div>
          </LiquidGlassCard>

          {/* -----------------------------------------------------------------------
              BOTTOM-RIGHT BENTO CARD: LOCATION & CAMERA DETAILS (4 COLUMNS RECTANGLE)
              ----------------------------------------------------------------------- */}
          <LiquidGlassCard
            hasTopSpecular={false}
            className="lg:col-span-4 rounded-xl border-white/[0.08] bg-black/60 p-2.5 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between"
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
                  <span className="text-white/45 text-[8.5px] uppercase truncate">OPTICAL SENSOR</span>
                  <span className="font-medium text-white truncate text-[10px]" title={stats.camera_source}>
                    {stats.camera_source || "Integrated (0)"}
                  </span>
                </div>

                {/* Facility Location / Zone */}
                <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
                  <span className="text-white/45 text-[8.5px] uppercase truncate">ZONE / FACILITY</span>
                  <span className="font-medium text-cyan-300 truncate text-[10px]">
                    {stats.zone?.split("•")[0]?.trim() || "Terminal 04"}
                  </span>
                </div>

                {/* Resolution & Ingestion FPS */}
                <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
                  <span className="text-white/45 text-[8.5px] uppercase truncate">CAPTURE</span>
                  <span className="font-medium text-white text-[10px]">
                    {stats.resolution || "1280x720"} @ {stats.capture_fps || 30}
                  </span>
                </div>

                {/* Protocol & Ingestion */}
                <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
                  <span className="text-white/45 text-[8.5px] uppercase truncate">STREAM PROTOCOL</span>
                  <span className="font-medium text-white/90 text-[10px]">
                    MJPEG Zero-latency
                  </span>
                </div>

                {/* AI Model Pipeline */}
                <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
                  <span className="text-white/45 text-[8.5px] uppercase truncate">AI PIPELINE</span>
                  <span className="font-medium text-white/90 text-[10px]">
                    YOLO26m + RF-21
                  </span>
                </div>

                {/* Operational Uptime */}
                <div className="flex flex-col justify-center p-1.5 rounded border border-white/[0.04] bg-white/[0.02]">
                  <span className="text-white/45 text-[8.5px] uppercase truncate">SYSTEM UPTIME</span>
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
        </section>
      </div>

      {/* Floating Speed Dial Controls (Bottom Right - Matching Circle in Wireframe) */}
      <LiquidNavMenu
        isPaused={isPaused}
        onTogglePlayPause={() => setIsPaused((prev) => !prev)}
        position="bottom-right"
      />
    </main>
  );
}
