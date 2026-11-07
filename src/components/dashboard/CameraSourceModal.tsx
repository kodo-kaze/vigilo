"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LiquidGlassCard,
  LiquidGlassButton,
  LiquidPill,
  GlassInput,
} from "@/src/components/ui";
import CameraSourceNodeCard from "./CameraSourceNodeCard";
import {
  TelemetryStats,
  CameraPreset,
  CameraSourcesResponse,
  SwitchCameraRequest,
  TestConnectionResponse,
} from "./types";

const RECENT_CAMERAS_KEY = "vigilo_recent_ip_cameras";

export interface CameraSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  stats: TelemetryStats;
  onCameraSwitched: (newSourceInfo: Record<string, unknown>) => void;
}

interface SavedCamera {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: "rtsp" | "http" | "https";
  path?: string;
  zone?: string;
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
  const [showAuth, setShowAuth] = useState<boolean>(false);
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
      const newEntry: SavedCamera = {
        id: `${cam.ip}:${cam.port}`,
        name: cam.name || `Camera (${cam.ip}:${cam.port})`,
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
      setStatusMessage({ type: "error", text: "Please enter a valid IP address first." });
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
          message: "Backend returned an error while testing port.",
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestResult({
        reachable: false,
        ip: ip.trim(),
        port: parsedPort,
        latency_ms: 0,
        message: `Failed to reach backend: ${err.message}`,
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
        name: cameraName.trim() || `IP Camera (${ip.trim()}:${parsedPort})`,
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

        // Auto close after brief success indication
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
          text: `Switched optical stream to ${preset.name}`,
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
        text: "Please enter a valid RTSP/HTTP URL or file path.",
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
          text: err.error || "Failed to switch source.",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <LiquidGlassCard
        hasTopSpecular={true}
        className="w-full max-w-2xl p-0 rounded-2xl border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 sm:px-6 py-4 bg-white/[0.015]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)]">
              <svg
                className="h-4 w-4"
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
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                  Optical Node Switcher
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[9px] font-mono text-white/40 uppercase">
                  Runtime Ingestion
                </span>
              </div>
              <h2
                id="camera-modal-title"
                className="text-base sm:text-lg font-semibold tracking-tight text-white/95 font-sans"
              >
                Select Camera Feed &amp; Network Port
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Current Active Source Pill Strip */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-white/[0.06] bg-black/30 backdrop-blur-sm text-[11px] font-mono">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-white/40 uppercase text-[10px] tracking-wider shrink-0">
              Active Sensor:
            </span>
            <span className="text-white/90 font-medium truncate">
              {stats.camera_source || "Integrated (Index 0)"}
            </span>
            {stats.camera_ip && (
              <LiquidPill size="xs" variant="cyan">
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
          >
            {stats.camera_connected ? "STREAM LIVE" : "STANDBY"}
          </LiquidPill>
        </div>

        {/* Modern Capsule Tab Selector */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center p-1 rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-md gap-1">
            {[
              {
                id: "ip_port" as const,
                label: "Network IP & Port",
                icon: (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                ),
              },
              {
                id: "presets" as const,
                label: "Interfaces & Presets",
                icon: (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ),
              },
              {
                id: "custom_uri" as const,
                label: "Direct URI / File",
                icon: (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-200 select-none ${
                    isActive
                      ? "bg-white/[0.08] text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.02] border border-transparent"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between backdrop-blur-md transition-all ${
                statusMessage.type === "success"
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "border-red-500/40 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
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
            </div>
          )}

          {/* TAB 1: CONNECT BY IP & PORT */}
          {activeTab === "ip_port" && (
            <form onSubmit={handleSwitchByIpPort} className="space-y-4">
              {/* Protocol Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2 select-none">
                  Stream Protocol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rtsp", "http", "https"] as const).map((proto) => {
                    const isSelected = protocol === proto;
                    return (
                      <button
                        key={proto}
                        type="button"
                        onClick={() => {
                          setProtocol(proto);
                          if (proto === "rtsp" && (port === "8080" || port === "80"))
                            setPort("554");
                          if (proto === "http" && port === "554") setPort("8080");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 select-none ${
                          isSelected
                            ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/30"
                            : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span className="uppercase font-semibold">{proto}</span>
                        <span className="text-[9px] text-white/40">
                          {proto === "rtsp"
                            ? "(Default CCTV)"
                            : proto === "http"
                            ? "(Web/MJPEG)"
                            : "(TLS)"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* IP Address and Port Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <GlassInput
                    label="Camera IP Address or Hostname"
                    requiredIndicator
                    required
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. 192.168.1.100 or cam01.local"
                  />
                </div>

                <div className="sm:col-span-4">
                  <GlassInput
                    label="Port"
                    requiredIndicator
                    required
                    type="number"
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={protocol === "rtsp" ? "554" : "8080"}
                  />
                </div>
              </div>

              {/* Stream Path & Facility Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassInput
                  label="Stream Path / Channel (Optional)"
                  type="text"
                  value={streamPath}
                  onChange={(e) => setStreamPath(e.target.value)}
                  placeholder="/live or /h264 or /video"
                />

                <GlassInput
                  label="Zone Location Label"
                  type="text"
                  value={facilityZone}
                  onChange={(e) => setFacilityZone(e.target.value)}
                  placeholder="e.g. Concourse A • Turnstiles"
                />
              </div>

              {/* Optional Camera Name */}
              <GlassInput
                label="Camera Display Name (Optional)"
                type="text"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="e.g. South Transit Hub Camera 04"
              />

              {/* Camera Authentication Collapsible */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-3 transition-colors">
                <button
                  type="button"
                  onClick={() => setShowAuth((prev) => !prev)}
                  className="flex items-center justify-between w-full text-[10.5px] font-mono text-white/70 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-3.5 w-3.5 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>CCTV Node Authentication (Optional)</span>
                  </span>
                  <span className="text-white/40 text-[10px]">
                    {showAuth ? "▲ Hide" : "▼ Show Credentials"}
                  </span>
                </button>

                {showAuth && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                    <GlassInput
                      label="Username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                    />
                    <GlassInput
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>

              {/* Resolved Preview Card */}
              {constructedUri && (
                <div className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-3 font-mono text-xs">
                  <div className="text-white/40 uppercase text-[9px] tracking-wider mb-1 flex items-center justify-between">
                    <span>Ingestion Stream URI</span>
                    <span className="text-cyan-400/80">Active Syntax Preview</span>
                  </div>
                  <div className="text-cyan-300 break-all select-all font-mono">
                    {constructedUri}
                  </div>
                </div>
              )}

              {/* Test Reachability Result */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 backdrop-blur-sm ${
                    testResult.reachable
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-amber-500/40 bg-amber-950/30 text-amber-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      testResult.reachable ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                    }`}
                  />
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <LiquidGlassButton
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !ip.trim()}
                  size="sm"
                  variant="subtle"
                  className="font-mono text-xs uppercase tracking-wider"
                  iconLeft={
                    isTesting ? (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <span>⚡</span>
                    )
                  }
                >
                  {isTesting ? "Testing Port..." : "Test IP & Port"}
                </LiquidGlassButton>

                <LiquidGlassButton
                  type="submit"
                  disabled={isSwitching || !ip.trim()}
                  size="sm"
                  variant="cyan"
                  className="font-mono text-xs uppercase tracking-wider"
                  iconRight={
                    isSwitching ? (
                      <span className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <span>↗</span>
                    )
                  }
                >
                  {isSwitching ? "CONNECTING SENSOR..." : "CONNECT & STREAM"}
                </LiquidGlassButton>
              </div>

              {/* Saved / Recent IP Cameras */}
              {savedCameras.length > 0 && (
                <div className="pt-3 border-t border-white/[0.08]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-2 flex items-center justify-between">
                    <span>Recent IP Cameras</span>
                    <span className="text-white/30 text-[9px]">Click to auto-fill</span>
                  </div>
                  <div className="space-y-1.5">
                    {savedCameras.map((cam) => (
                      <div
                        key={cam.id}
                        onClick={() => handleLoadSavedCamera(cam)}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all cursor-pointer font-mono text-[11px]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-cyan-400">🌐</span>
                          <span className="text-white/90 group-hover:text-cyan-300 font-medium truncate">
                            {cam.name}
                          </span>
                          <span className="text-[10px] text-white/40 shrink-0">
                            ({cam.ip}:{cam.port})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {cam.zone && (
                            <span className="text-[9px] uppercase text-white/40 hidden sm:inline">
                              {cam.zone}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => removeRecentCamera(cam.id, e)}
                            className="text-white/30 hover:text-red-400 transition-colors p-1"
                            title="Remove from history"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: INTERFACES & PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              {/* Local Hardware Interfaces */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5 select-none">
                  <span>Local Hardware Sensors</span>
                  <span className="text-white/30">(Webcams &amp; Capture Cards)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    sourcesData?.interfaces || [
                      {
                        id: "webcam-0",
                        name: "Integrated HD Camera (Index 0)",
                        type: "webcam",
                        source: "0",
                        zone: "Local Sensor • Main Desk",
                        description: "Primary built-in webcam index 0",
                      },
                      {
                        id: "webcam-1",
                        name: "External USB Camera (Index 1)",
                        type: "webcam",
                        source: "1",
                        zone: "Auxiliary Ingest • Zone External",
                        description: "Secondary USB peripheral optical ingestion",
                      },
                    ]
                  ).map((item) => {
                    const isCurrent =
                      stats.camera_source?.includes(`(${item.source})`) ||
                      stats.camera_source === item.name;
                    return (
                      <CameraSourceNodeCard
                        key={item.id}
                        name={item.name}
                        description={item.description || item.zone}
                        badgeLeft={`Device Index ${item.source}`}
                        badgeRight={isCurrent ? "Active Sensor" : undefined}
                        isCurrent={isCurrent}
                        isLoading={isSwitching}
                        actionLabel="Switch to Device"
                        onSelect={() => handleSelectPreset(item)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Pre-configured CCTV Nodes */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center justify-between select-none">
                  <span>Pre-Configured CCTV Camera Nodes</span>
                  <span className="text-white/30 text-[9px]">RTSP / HTTP Network Nodes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    sourcesData?.presets || [
                      {
                        id: "concourse-a",
                        name: "Concourse A — Turnstiles",
                        type: "ip_camera",
                        ip: "192.168.1.101",
                        port: 554,
                        protocol: "rtsp",
                        path: "/live",
                        source: "rtsp://192.168.1.101:554/live",
                        zone: "Terminal Concourse 04 • Zone A",
                      },
                      {
                        id: "concourse-b",
                        name: "Concourse B — Main Escalator Gate",
                        type: "ip_camera",
                        ip: "192.168.1.102",
                        port: 554,
                        protocol: "rtsp",
                        path: "/live",
                        source: "rtsp://192.168.1.102:554/live",
                        zone: "Terminal Concourse 04 • Zone B",
                      },
                      {
                        id: "platform-3",
                        name: "Platform 03 — Boarding Hall",
                        type: "ip_camera",
                        ip: "192.168.1.103",
                        port: 554,
                        protocol: "rtsp",
                        path: "/h264",
                        source: "rtsp://192.168.1.103:554/h264",
                        zone: "Platform Hub • Level 2 North",
                      },
                      {
                        id: "security-gate",
                        name: "Security Checkpoint 01 Entry",
                        type: "ip_camera",
                        ip: "192.168.1.104",
                        port: 8080,
                        protocol: "http",
                        path: "/video",
                        source: "http://192.168.1.104:8080/video",
                        zone: "North Terminal • Security Screening",
                      },
                    ]
                  ).map((preset) => {
                    const isCurrent =
                      stats.camera_ip === preset.ip &&
                      Number(stats.camera_port) === preset.port;
                    return (
                      <CameraSourceNodeCard
                        key={preset.id}
                        name={preset.name}
                        description={preset.zone}
                        badgeLeft={`${preset.ip}:${preset.port}`}
                        badgeRight={(preset.protocol || "rtsp").toUpperCase()}
                        isCurrent={isCurrent}
                        isLoading={isSwitching}
                        actionLabel="Switch to Node"
                        onSelect={() => handleSelectPreset(preset)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT URI OR FILE */}
          {activeTab === "custom_uri" && (
            <form onSubmit={handleSwitchByUri} className="space-y-4">
              <GlassInput
                label="Stream URI / Video File Path"
                requiredIndicator
                required
                type="text"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
                placeholder="rtsp://192.168.1.50:554/live or /path/to/cctv_test.mp4"
                helperText="Accepts complete RTSP stream links, HTTP MJPEG endpoints, or local looping video file paths."
              />

              <GlassInput
                label="Facility Zone Label"
                type="text"
                value={facilityZone}
                onChange={(e) => setFacilityZone(e.target.value)}
                placeholder="e.g. Custom Stream Zone • Concourse 04"
              />

              <div className="flex justify-end pt-3 border-t border-white/[0.08]">
                <LiquidGlassButton
                  type="submit"
                  disabled={isSwitching || !customUri.trim()}
                  size="sm"
                  variant="cyan"
                  className="font-mono text-xs uppercase tracking-wider"
                  iconRight={
                    isSwitching ? (
                      <span className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <span>↗</span>
                    )
                  }
                >
                  {isSwitching ? "CONNECTING..." : "INGEST STREAM"}
                </LiquidGlassButton>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-white/[0.08] px-5 sm:px-6 py-2.5 bg-black/30 backdrop-blur-sm flex items-center justify-between text-[9.5px] font-mono text-white/40 select-none">
          <span>Target Backend: {backendUrl}</span>
          <span className="text-cyan-400/70">Zero-Latency Ingestion Pipeline</span>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
