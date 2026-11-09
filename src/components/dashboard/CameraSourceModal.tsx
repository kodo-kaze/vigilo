"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LiquidGlassCard,
  LiquidGlassButton,
  LiquidPill,
  LiquidInnerCard,
} from "@/src/components/ui";
import CameraNetworkStreamTab from "./CameraNetworkStreamTab";
import CameraPresetsTab from "./CameraPresetsTab";
import CameraCustomUriTab from "./CameraCustomUriTab";
import {
  TelemetryStats,
  CameraPreset,
  CameraSourcesResponse,
  SwitchCameraRequest,
  TestConnectionResponse,
  SavedCamera,
} from "./types";

const RECENT_CAMERAS_KEY = "vigilo_recent_ip_cameras";

export interface CameraSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  stats: TelemetryStats;
  onCameraSwitched: (newSourceInfo: Record<string, unknown>) => void;
}

export default function CameraSourceModal({
  isOpen,
  onClose,
  backendUrl,
  stats,
  onCameraSwitched,
}: CameraSourceModalProps) {
  const [activeTab, setActiveTab] = useState<"ip_port" | "presets" | "custom_uri">("ip_port");

  // Form states for IP & Port
  const [ip, setIp] = useState<string>("");
  const [port, setPort] = useState<string>("554");
  const [protocol, setProtocol] = useState<"rtsp" | "http" | "https">("rtsp");
  const [streamPath, setStreamPath] = useState<string>("/live");
  const [cameraName, setCameraName] = useState<string>("");
  const [facilityZone, setFacilityZone] = useState<string>(
    stats.zone || "Terminal Concourse 04 • Zone B"
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Raw URI state
  const [customUri, setCustomUri] = useState<string>("");

  // UI status states
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Backend preset sources
  const [sourcesData, setSourcesData] = useState<CameraSourcesResponse | null>(null);

  // Load saved recent cameras lazily from localStorage
  const [savedCameras, setSavedCameras] = useState<SavedCamera[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RECENT_CAMERAS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Fetch available camera presets from backend
  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/camera/sources`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setSourcesData(data);
      }
    } catch {
      // Backend might be offline
    }
  }, [backendUrl]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchSources();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchSources]);

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  }, [isClosing, onClose]);

  // Reset closing flag when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  // Helper to persist a successful camera to recent list
  const persistRecentCamera = (cam: {
    ip: string;
    port: number;
    protocol: "rtsp" | "http" | "https";
    path?: string;
    name?: string;
    zone?: string;
  }) => {
    try {
      const displayName = cam.name || `Camera ${cam.ip}:${cam.port}`;
      const newEntry: SavedCamera = {
        id: `${cam.ip}:${cam.port}`,
        name: displayName,
        ip: cam.ip,
        port: cam.port,
        protocol: cam.protocol,
        path: cam.path,
        zone: cam.zone,
      };
      setSavedCameras((prev) => {
        const filtered = prev.filter((p) => !(p.ip === cam.ip && p.port === cam.port));
        const updated = [newEntry, ...filtered].slice(0, 5);
        try {
          localStorage.setItem(RECENT_CAMERAS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch {}
  };

  const removeRecentCamera = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCameras((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(RECENT_CAMERAS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Construct preview URI
  const constructedUri = useMemo(() => {
    if (!ip.trim()) return "";
    const cleanPort = port.trim() || (protocol === "rtsp" ? "554" : "8080");
    const cleanPath = streamPath.trim()
      ? streamPath.startsWith("/")
        ? streamPath
        : `/${streamPath}`
      : "";
    const authPart = username.trim() ? `${username}:${password ? "••••••" : ""}@` : "";
    return `${protocol}://${authPart}${ip.trim()}:${cleanPort}${cleanPath}`;
  }, [ip, port, protocol, streamPath, username, password]);

  // Test TCP socket reachability for IP & Port
  const handleTestConnection = async () => {
    if (!ip.trim()) {
      setStatusMessage({ type: "error", text: "Please enter an IP address or hostname first." });
      return;
    }
    const parsedPort = parseInt(port.trim(), 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid port between 1 and 65535.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setStatusMessage(null);

    try {
      const res = await fetch(`${backendUrl}/camera/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip.trim(), port: parsedPort, timeout: 2.5 }),
      });
      if (res.ok) {
        const data: TestConnectionResponse = await res.json();
        setTestResult(data);
      } else {
        setTestResult({
          reachable: false,
          ip: ip.trim(),
          port: parsedPort,
          latency_ms: 0,
          message: "Unable to reach camera on this port.",
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestResult({
        reachable: false,
        ip: ip.trim(),
        port: parsedPort,
        latency_ms: 0,
        message: `Connection error: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Submit IP & Port switch
  const handleSwitchByIpPort = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ip.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter a camera IP address or hostname.",
      });
      return;
    }

    const parsedPort = parseInt(port.trim(), 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid port number (1 - 65535).",
      });
      return;
    }

    setIsSwitching(true);
    setStatusMessage(null);

    try {
      const payload: SwitchCameraRequest = {
        ip: ip.trim(),
        port: parsedPort,
        protocol,
        path: streamPath.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
        name: cameraName.trim() || `Camera (${ip.trim()}:${parsedPort})`,
        zone: facilityZone.trim() || undefined,
        auto_resume: true,
      };

      const res = await fetch(`${backendUrl}/camera/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        persistRecentCamera({
          ip: ip.trim(),
          port: parsedPort,
          protocol,
          path: streamPath.trim(),
          name: cameraName.trim(),
          zone: facilityZone.trim(),
        });

        setStatusMessage({
          type: "success",
          text: `Connected! Feed switched to ${data.display_name || ip}:${parsedPort}.`,
        });

        onCameraSwitched(data);

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({
          type: "error",
          text: errorData.error || "Failed to switch camera stream on backend.",
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setStatusMessage({
        type: "error",
        text: `Network error connecting to backend: ${err.message}`,
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Switch to preset or hardware device
  const handleSelectPreset = async (preset: CameraPreset) => {
    setIsSwitching(true);
    setStatusMessage(null);
    try {
      const payload: SwitchCameraRequest = {
        source: preset.source,
        name: preset.name,
        zone: preset.zone,
        auto_resume: true,
      };

      if (preset.ip && preset.port) {
        payload.ip = preset.ip;
        payload.port = preset.port;
        payload.protocol = (preset.protocol as "rtsp" | "http" | "https") || "rtsp";
        payload.path = preset.path;
      }

      const res = await fetch(`${backendUrl}/camera/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (preset.ip && preset.port) {
          persistRecentCamera({
            ip: preset.ip,
            port: preset.port,
            protocol: (preset.protocol as "rtsp" | "http" | "https") || "rtsp",
            path: preset.path,
            name: preset.name,
            zone: preset.zone,
          });
        }
        setStatusMessage({
          type: "success",
          text: `Switched stream to ${preset.name}`,
        });
        onCameraSwitched(data);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({
          type: "error",
          text: errorData.error || "Failed to switch camera preset.",
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setStatusMessage({
        type: "error",
        text: `Failed to contact backend: ${err.message}`,
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Switch by direct URI string
  const handleSwitchByUri = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUri.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid stream URL or video file path.",
      });
      return;
    }

    setIsSwitching(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${backendUrl}/camera/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: customUri.trim(),
          zone: facilityZone.trim() || undefined,
          auto_resume: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage({
          type: "success",
          text: `Connected to stream: ${data.display_name}`,
        });
        onCameraSwitched(data);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMessage({
          type: "error",
          text: err.error || "Failed to switch stream.",
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setStatusMessage({
        type: "error",
        text: `Error connecting to backend: ${err.message}`,
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Quick populate form from a saved camera
  const handleLoadSavedCamera = (cam: SavedCamera) => {
    setIp(cam.ip);
    setPort(String(cam.port));
    setProtocol(cam.protocol);
    setStreamPath(cam.path || "/live");
    setCameraName(cam.name);
    if (cam.zone) setFacilityZone(cam.zone);
    setActiveTab("ip_port");
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className={`liquid-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md ${
        isClosing ? "closing" : ""
      }`}
      onClick={handleClose}
    >
      <LiquidGlassCard
        hasTopSpecular={true}
        className={`liquid-modal-content w-full max-w-2xl p-0 rounded-2xl border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[90vh] ${
          isClosing ? "closing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 sm:px-6 py-4 bg-white/[0.015]">
          <div className="flex items-center gap-3.5">
            {/* App Logo Emblem (Replacing old cyan camera icon) */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] p-1.5 overflow-hidden select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Vigilo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-white/50 font-medium">
                  Video Feed Source
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] font-sans text-white/40">
                  Live Vision Ingestion
                </span>
              </div>
              <h2
                id="camera-modal-title"
                className="text-base sm:text-lg font-semibold tracking-tight text-white/95 font-sans"
              >
                Select Camera Source
              </h2>
            </div>
          </div>

          <LiquidGlassButton
            onClick={handleClose}
            size="sm"
            variant="subtle"
            className="!h-9 !w-9 !p-0 !rounded-full shrink-0 flex items-center justify-center !border-white/20 hover:!border-white/40 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]"
            aria-label="Close dialog"
            title="Close dialog"
          >
            <svg
              className="h-4 w-4 text-white/70 group-hover:text-white transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </LiquidGlassButton>
        </div>

        {/* Current Active Source Status Strip */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-white/[0.06] bg-black/30 backdrop-blur-sm text-xs font-sans">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white/45 text-[11px] font-medium shrink-0">
              Active Source:
            </span>
            <span className="text-white/90 font-medium truncate text-xs">
              {stats.camera_source || "Integrated Camera (Device 0)"}
            </span>
            {stats.camera_ip && (
              <LiquidPill size="xs" variant="default" textClassName="text-[10px] font-mono text-white/80">
                {stats.camera_ip}:{stats.camera_port}
              </LiquidPill>
            )}
          </div>
          <LiquidPill
            size="xs"
            variant={stats.camera_connected ? "success" : "warning"}
            icon={
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  stats.camera_connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
            }
            textClassName="text-[10px] font-mono font-medium"
          >
            {stats.camera_connected ? "LIVE FEED" : "STANDBY"}
          </LiquidPill>
        </div>

        {/* Segmented Liquid Glass Navigation Tabs (No neon glow) */}
        <div className="px-5 sm:px-6 pt-3.5 pb-2 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center p-1 rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-md gap-1">
            {[
              {
                id: "ip_port" as const,
                label: "Network Stream",
                badge: "IP & Port",
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                ),
              },
              {
                id: "presets" as const,
                label: "Cameras & Presets",
                badge: "Local & CCTV",
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ),
              },
              {
                id: "custom_uri" as const,
                label: "Custom URI / File",
                badge: "Direct Link",
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                ),
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusMessage(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-sans font-medium transition-all duration-200 select-none ${
                    isActive
                      ? "bg-white/[0.1] text-white border border-white/20"
                      : "text-white/55 hover:text-white hover:bg-white/[0.02] border border-transparent"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Status Message Banner (Clean LiquidInnerCard) */}
          {statusMessage && (
            <LiquidInnerCard
              className={`p-3.5 text-xs font-sans flex items-center justify-between ${
                statusMessage.type === "success"
                  ? "!border-emerald-500/30 !bg-emerald-950/40 text-emerald-300"
                  : "!border-red-500/30 !bg-red-950/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">
                  {statusMessage.type === "success" ? "✓" : "⚠"}
                </span>
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-white/40 hover:text-white ml-2 text-sm transition-colors"
              >
                ✕
              </button>
            </LiquidInnerCard>
          )}

          {/* TAB 1: CONNECT BY IP & PORT */}
          {activeTab === "ip_port" && (
            <CameraNetworkStreamTab
              protocol={protocol}
              setProtocol={setProtocol}
              ip={ip}
              setIp={setIp}
              port={port}
              setPort={setPort}
              streamPath={streamPath}
              setStreamPath={setStreamPath}
              cameraName={cameraName}
              setCameraName={setCameraName}
              facilityZone={facilityZone}
              setFacilityZone={setFacilityZone}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              constructedUri={constructedUri}
              isTesting={isTesting}
              isSwitching={isSwitching}
              onTestConnection={handleTestConnection}
              onSubmit={handleSwitchByIpPort}
              savedCameras={savedCameras}
              onLoadSavedCamera={handleLoadSavedCamera}
              onDeleteSavedCamera={removeRecentCamera}
            />
          )}

          {/* TAB 2: CAMERAS & PRESETS */}
          {activeTab === "presets" && (
            <CameraPresetsTab
              interfaces={sourcesData?.interfaces || []}
              presets={sourcesData?.presets || []}
              stats={stats}
              isSwitching={isSwitching}
              onSelectPreset={handleSelectPreset}
            />
          )}

          {/* TAB 3: DIRECT URI OR FILE */}
          {activeTab === "custom_uri" && (
            <CameraCustomUriTab
              customUri={customUri}
              setCustomUri={setCustomUri}
              facilityZone={facilityZone}
              setFacilityZone={setFacilityZone}
              isSwitching={isSwitching}
              onSubmit={handleSwitchByUri}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-white/[0.08] px-5 sm:px-6 py-2.5 bg-black/30 backdrop-blur-sm flex items-center justify-between text-[11px] font-sans text-white/40 select-none">
          <span>Backend Target: {backendUrl || "http://localhost:8000"}</span>
          <span className="text-white/40 font-mono text-[10px]">Active Vision Ingestion</span>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
