"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  UiloraLiquidChrome,
  LiquidNavMenu,
  DashboardVideoFeed,
  CrowdDynamicsCard,
  CameraDetailsCard,
  CameraSourceModal,
  type TelemetryStats,
} from "@/src/components/ui";

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const AUTO_START_STORAGE_KEY = "vigilo_auto_start_camera";

export default function DashboardPage() {
  const [isPaused, setIsPaused] = useState(false);
  const backendUrl = DEFAULT_BACKEND_URL;
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [isPowerToggling, setIsPowerToggling] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Initialize autoStartCamera lazily from localStorage to prevent setState in effect
  const [autoStartCamera, setAutoStartCamera] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTO_START_STORAGE_KEY);
        if (stored !== null) {
          return stored === "true";
        }
      } catch {
        // ignore
      }
    }
    return false;
  });

  const hasAutoEngagedRef = useRef(false);

  const [stats, setStats] = useState<TelemetryStats>({
    status: "CONNECTING",
    is_suspended: true,
    is_crowd: false,
    crowd_probability: 0.0,
    people_count: 0,
    density_per_megapixel: 0.0,
    nearest_neighbor_distance: 0.0,
    dense_clusters_count: 0,
    gatherings_count: 0,
    isolated_count: 0,
    heatmap_enabled: true,
    clusters_enabled: true,
    fps: 0.0,
    capture_fps: 0.0,
    camera_connected: false,
    resolution: "Detecting...",
    camera_source: "Integrated Camera (Index 0)",
    zone: "Terminal Concourse 04 • Zone B",
    model_mesh: "YOLO26m + Conflux Random Forest + Spatial Clustering",
    uptime_seconds: 0,
  });

  const [streamKey, setStreamKey] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleAutoStart = useCallback(() => {
    setAutoStartCamera((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUTO_START_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

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
        if (data.camera_connected && !data.is_suspended) {
          setStreamConnected(true);
        } else if (data.is_suspended) {
          setStreamConnected(false);
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

  // If user enabled auto-start, automatically wake up the camera once on dashboard load
  useEffect(() => {
    if (autoStartCamera && !hasAutoEngagedRef.current && stats.is_suspended) {
      hasAutoEngagedRef.current = true;
      fetch(`${DEFAULT_BACKEND_URL}/camera/resume`, {
        method: "POST",
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          if (res.ok) {
            setStreamError(false);
            setStreamKey((k) => k + 1);
            fetchTelemetry();
          }
        })
        .catch(() => {});
    }
  }, [autoStartCamera, stats.is_suspended, fetchTelemetry]);

  // Restart stream image on retry
  const handleRetry = () => {
    setStreamError(false);
    setStreamKey((prev) => prev + 1);
    fetchTelemetry();
  };

  // Called when camera is switched via modal (IP:Port, preset, etc.)
  const handleCameraSwitched = useCallback(() => {
    setStreamError(false);
    setStreamConnected(true);
    setStreamKey((prev) => prev + 1);
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Toggle backend camera & inference power suspension
  const handleTogglePower = useCallback(async () => {
    setIsPowerToggling(true);
    try {
      const res = await fetch(`${DEFAULT_BACKEND_URL}/camera/toggle`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats((prev) => ({
          ...prev,
          is_suspended: data.suspended,
          status: data.suspended ? "SUSPENDED" : "INITIALIZING",
        }));
        if (!data.suspended) {
          setStreamError(false);
          setStreamKey((prev) => prev + 1);
        }
      }
    } catch (e) {
      console.error("Failed to toggle camera power:", e);
    } finally {
      setIsPowerToggling(false);
      fetchTelemetry();
    }
  }, [fetchTelemetry]);

  // Toggle 2D ground thermal density heatmap
  const handleToggleHeatmap = useCallback(async () => {
    const nextVal = !(stats.heatmap_enabled ?? true);
    setStats((prev) => ({ ...prev, heatmap_enabled: nextVal }));
    try {
      await fetch(`${DEFAULT_BACKEND_URL}/camera/options?heatmap=${nextVal}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      console.error("Failed to toggle ground heatmap:", e);
    }
  }, [stats.heatmap_enabled]);

  // Toggle density-aware spatial cluster hulls and gatherings
  const handleToggleClusters = useCallback(async () => {
    const nextVal = !(stats.clusters_enabled ?? true);
    setStats((prev) => ({ ...prev, clusters_enabled: nextVal }));
    try {
      await fetch(`${DEFAULT_BACKEND_URL}/camera/options?clusters=${nextVal}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      console.error("Failed to toggle spatial clusters:", e);
    }
  }, [stats.clusters_enabled]);

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
      {/* 
        The Animated Liquid Chrome Engine (Matching 404 Page Liquid Dynamics)
        - baseColor: Deep void shadows
        - chromeColor: Pure radiant liquid silver highlights (#f0f0f0)
        - viscosity: 0.3 for heavy fluid mercury feel
        - distortion: 0.7 for dynamic reactivity
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <UiloraLiquidChrome
          baseColor="#040508"
          chromeColor="#f0f0f0"
          viscosity={0.3}
          speed={0.4}
          distortion={0.7}
          isPaused={isPaused}
        />
      </div>

      {/* Decorative Vignette matching 404 page (No heavy darkening blanket) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(4,5,8,0.5)_0%,rgba(4,5,8,0.25)_40%,rgba(4,5,8,0.88)_100%)]"
      />

      {/* Main Glass Workspace Container (Wide Bento Frame, Zero-Scroll) */}
      <div className="relative z-10 mx-auto w-full max-w-[1640px] h-full flex flex-col justify-between gap-2.5 sm:gap-3">
        {/* TOP SECTION: LIVE VIDEO FOOTAGE */}
        <DashboardVideoFeed
          backendUrl={backendUrl}
          stats={stats}
          streamConnected={streamConnected}
          streamError={streamError}
          streamKey={streamKey}
          isAlert={isAlert}
          onRetry={handleRetry}
          onStreamLoad={() => {
            setStreamError(false);
            setStreamConnected(true);
          }}
          onStreamError={() => {
            setStreamError(true);
            setStreamConnected(false);
          }}
          onTogglePower={handleTogglePower}
          isPowerToggling={isPowerToggling}
          autoStartCamera={autoStartCamera}
          onToggleAutoStart={handleToggleAutoStart}
          onOpenSourceModal={() => setIsSourceModalOpen(true)}
          onToggleHeatmap={handleToggleHeatmap}
          onToggleClusters={handleToggleClusters}
        />

        {/* BOTTOM ROW: RECTANGULAR BENTO GRID (INSET SLIGHTLY LESSER WIDTH THAN VIDEO) */}
        <section className="shrink-0 w-full max-w-[92%] sm:max-w-[90%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 select-none">
          {/* BOTTOM-LEFT BENTO CARD: CROWD DYNAMICS (8 COLUMNS) */}
          <CrowdDynamicsCard
            stats={stats}
            isAlert={isAlert}
            probabilityPercent={probabilityPercent}
          />

          {/* BOTTOM-RIGHT BENTO CARD: LOCATION & CAMERA DETAILS (4 COLUMNS) */}
          <CameraDetailsCard
            stats={stats}
            formatUptime={formatUptime}
            onTogglePower={handleTogglePower}
            isPowerToggling={isPowerToggling}
            autoStartCamera={autoStartCamera}
            onToggleAutoStart={handleToggleAutoStart}
            onOpenSourceModal={() => setIsSourceModalOpen(true)}
          />
        </section>
      </div>

      {/* Camera Ingestion Source & IP Modal */}
      <CameraSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        backendUrl={backendUrl}
        stats={stats}
        onCameraSwitched={handleCameraSwitched}
      />

      {/* Floating Speed Dial Controls (Bottom Right - Matching Circle in Wireframe) */}
      <LiquidNavMenu
        isPaused={isPaused}
        onTogglePlayPause={() => setIsPaused((prev) => !prev)}
        position="bottom-right"
      />
    </main>
  );
}
