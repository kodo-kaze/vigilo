"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import UiloraLiquidChrome from "@/src/components/ui/UiloraLiquidChrome";
import LiquidNavMenu from "@/src/components/ui/LiquidNavMenu";

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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#040508] text-white selection:bg-cyan-500/20 selection:text-white p-3 sm:p-5 lg:p-7 flex flex-col justify-between">
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

      {/* Main Glass Workspace Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col gap-4 sm:gap-5">
        {/* Top Minimal Branding & Status Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 select-none">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition hover:opacity-85"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl">
                <span className="text-sm font-bold tracking-wider text-white">V</span>
              </div>
              <span className="text-base font-semibold tracking-[0.25em] text-white">
                VIGILO<span className="text-cyan-400">.</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block h-3.5 w-px bg-white/20" />
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-white/50 uppercase">
              Predictive AI Conflux Terminal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Stream Heartbeat Indicator */}
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono tracking-wider transition-colors duration-300 ${
                streamConnected
                  ? isAlert
                    ? "border-red-500/40 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                    : "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-amber-500/40 bg-amber-950/40 text-amber-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  streamConnected
                    ? isAlert
                      ? "bg-red-400 animate-ping"
                      : "bg-emerald-400 animate-pulse"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="font-semibold">
                {streamConnected
                  ? isAlert
                    ? "CROWD SURGE ALERT"
                    : "NORMAL FLOW • CONNECTED"
                  : "CAMERA STANDBY"}
              </span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            TOP SECTION: LIVE VIDEO FOOTAGE WITH ANNOTATIONS MARKERS
            ========================================================================= */}
        <section className="relative w-full rounded-2xl border border-white/15 bg-black/60 backdrop-blur-2xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col">
          {/* Header Bar inside Video Enclosure */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-black/40 text-xs font-mono select-none">
            <div className="flex items-center gap-2.5 text-white/80">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tracking-widest uppercase font-semibold text-white">
                Live Video Footage
              </span>
              <span className="text-white/40">{"//"}</span>
              <span className="text-cyan-300 text-[11px]">
                AI Bounding Annotations Active
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-white/60">
              <span>{stats.resolution || "1280x720"}</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400 font-semibold">
                {stats.capture_fps ? `${stats.capture_fps} FPS` : "Live Ingestion"}
              </span>
            </div>
          </div>

          {/* Video Player Display Area */}
          <div className="relative aspect-video w-full max-h-[62vh] min-h-[320px] sm:min-h-[420px] bg-[#020306] flex items-center justify-center overflow-hidden">
            {/* The Live MJPEG Stream */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={streamKey}
              src={`${backendUrl}/video_feed`}
              alt="Live Vigilo CCTV Stream"
              className={`h-full w-full object-contain transition-opacity duration-500 ${
                streamError ? "opacity-0 pointer-events-none" : "opacity-100"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#05070d]/90 backdrop-blur-md">
                {/* Radar Grid Animation */}
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
                  <div className="absolute inset-5 rounded-full border border-white/20" />
                  <svg
                    className="h-7 w-7 text-cyan-400 animate-pulse"
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

                <h3 className="text-base sm:text-lg font-semibold tracking-wide text-white">
                  Camera Feed Offline or Initializing
                </h3>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                  The AI stream server is waiting for optical ingestion. Ensure the backend
                  server is running on{" "}
                  <code className="text-cyan-300 font-mono text-xs">{backendUrl}</code> with
                  your integrated webcam or camera enabled.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="liquid-glass-btn flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono font-medium tracking-wider text-white transition hover:scale-105 active:scale-95"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-cyan-400"
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
                    RETRY FEED CONNECTION
                  </button>

                  <a
                    href={`${backendUrl}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-mono text-white/60 hover:text-white transition"
                  >
                    API Docs ↗
                  </a>
                </div>
              </div>
            )}

            {/* In-feed subtle corner telemetry tags */}
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-mono tracking-wider text-white/90 backdrop-blur-md">
                ZONE: {stats.zone?.split("•")[0]?.trim() || "ZONE 01"}
              </span>
              <span
                className={`rounded-md border px-2.5 py-1 text-[10px] font-mono tracking-wider backdrop-blur-md font-semibold ${
                  isAlert
                    ? "border-red-500/40 bg-red-950/80 text-red-300"
                    : "border-emerald-500/40 bg-emerald-950/80 text-emerald-300"
                }`}
              >
                {stats.status}
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3">
              <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-mono tracking-wider text-cyan-300 backdrop-blur-md">
                FPS: {stats.fps.toFixed(1)}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM ROW: SEPARATED DETAILS BOXES (MATCHING WIREFRAME LAYOUT)
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 select-none">
          {/* -----------------------------------------------------------------------
              BOTTOM-LEFT BOX: VIDEO CROWD DETAILS (FPS, DENSITY, PEOPLE COUNT, ETC.)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
                    Crowd Dynamics & Flow Telemetry
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  REAL-TIME INFERENCE
                </span>
              </div>

              {/* Crowd Probability Progress Gauge */}
              <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-white/70">Crowd Surge Probability</span>
                  <span
                    className={`font-semibold text-sm ${
                      isAlert ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {probabilityPercent}%
                  </span>
                </div>
                {/* Smooth Animated Gauge Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isAlert
                        ? "bg-gradient-to-r from-amber-500 via-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                        : "bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, probabilityPercent))}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>0% (Safe Sparse)</span>
                  <span>50% (Surge Threshold)</span>
                  <span>100% (Dense Bottleneck)</span>
                </div>
              </div>

              {/* Primary 4 Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: People Count */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                    Detected People
                  </span>
                  <div className="my-1.5 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                      {stats.people_count}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">pedestrians</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40">
                    Instant Bounding Count
                  </span>
                </div>

                {/* Metric 2: Density per Megapixel */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                    Spatial Density
                  </span>
                  <div className="my-1.5 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                      {stats.density_per_megapixel.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-mono text-white/60">/ MP</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40">
                    Area Saturation Index
                  </span>
                </div>

                {/* Metric 3: Nearest Neighbor Distance */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                    NN Proximity
                  </span>
                  <div className="my-1.5 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                      {stats.nearest_neighbor_distance.toFixed(3)}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40">
                    Cluster Tightness Ratio
                  </span>
                </div>

                {/* Metric 4: AI Inference FPS */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                    Inference FPS
                  </span>
                  <div className="my-1.5 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-cyan-300">
                      {stats.fps.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">fps</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40">
                    Neural Engine Speed
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom footnote */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Telemetry Ingestion: Active (0.45s loop)</span>
              <span>Classification: Random Forest Temporal Smoothing</span>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              BOTTOM-RIGHT BOX: LOCATION AND CAMERA DETAILS
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-white/90">
                    Location &amp; Camera Details
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  NODE CONFIG
                </span>
              </div>

              {/* Key/Value Specification Rows */}
              <div className="space-y-3 font-mono text-xs">
                {/* Active Camera Device */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">OPTICAL SENSOR</span>
                  <span className="font-medium text-white text-right truncate max-w-[200px]" title={stats.camera_source}>
                    {stats.camera_source || "Integrated Camera (0)"}
                  </span>
                </div>

                {/* Facility Location / Zone */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">ZONE / FACILITY</span>
                  <span className="font-medium text-cyan-300 text-right truncate max-w-[200px]">
                    {stats.zone || "Terminal Concourse 04"}
                  </span>
                </div>

                {/* Resolution & Ingestion FPS */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">RESOLUTION / CAPTURE</span>
                  <span className="font-medium text-white">
                    {stats.resolution || "1280x720"} @ {stats.capture_fps || 30} FPS
                  </span>
                </div>

                {/* Protocol & Ingestion */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">STREAM PROTOCOL</span>
                  <span className="font-medium text-white/90">
                    MJPEG Zero-latency Ingest
                  </span>
                </div>

                {/* AI Model Pipeline */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">AI PIPELINE</span>
                  <span className="font-medium text-white/90">
                    YOLO26m + RF-21 Features
                  </span>
                </div>

                {/* Operational Uptime */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                  <span className="text-white/50 text-[11px]">SYSTEM UPTIME</span>
                  <span className="font-medium text-emerald-400">
                    {formatUptime(stats.uptime_seconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Status Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Driver: AVFoundation / OpenCV
              </span>
              <span>Mesh Sync: Nominal</span>
            </div>
          </div>
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
