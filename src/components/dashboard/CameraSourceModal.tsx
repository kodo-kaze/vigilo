"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiquidGlassButton } from "@/src/components/ui";
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
  const [facilityZone, setFacilityZone] = useState<string>(stats.zone || "Terminal Concourse 04 • Zone B");
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Raw URI state
  const [customUri, setCustomUri] = useState<string>("");

  // UI status states
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
  const constructedUri = React.useMemo(() => {
    if (!ip.trim()) return "";
    const cleanPort = port.trim() || (protocol === "rtsp" ? "554" : "8080");
    const cleanPath = streamPath.trim() ? (streamPath.startsWith("/") ? streamPath : `/${streamPath}`) : "";
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
      setStatusMessage({ type: "error", text: "Please enter a valid port between 1 and 65535." });
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
      setStatusMessage({ type: "error", text: "Please enter a camera IP address or hostname." });
      return;
    }

    const parsedPort = parseInt(port.trim(), 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      setStatusMessage({ type: "error", text: "Please enter a valid port number (1 - 65535)." });
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
      setStatusMessage({ type: "error", text: "Please enter a valid RTSP/HTTP URL or file path." });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-[#07090e]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
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
                <span className="text-[9px] font-mono text-white/40 uppercase">Runtime Ingestion</span>
              </div>
              <h2
                id="camera-modal-title"
                className="text-base sm:text-lg font-semibold tracking-tight text-white/95"
              >
                Select Camera Feed &amp; Network Port
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Current Active Source Pill */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-white/[0.06] bg-black/40 text-[10px] font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-white/40 uppercase">Active Sensor:</span>
            <span className="text-white/90 font-medium truncate">
              {stats.camera_source || "Integrated (Index 0)"}
            </span>
            {stats.camera_ip && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[9px]">
                {stats.camera_ip}:{stats.camera_port}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 shrink-0 text-white/50">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stats.camera_connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            {stats.camera_connected ? "STREAM LIVE" : "STANDBY"}
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.08] px-5 bg-white/[0.01]">
          <button
            onClick={() => {
              setActiveTab("ip_port");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-mono font-medium transition-all ${
              activeTab === "ip_port"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Network IP &amp; Port</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("presets");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-mono font-medium transition-all ${
              activeTab === "presets"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Interfaces &amp; Presets</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("custom_uri");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-mono font-medium transition-all ${
              activeTab === "custom_uri"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Direct URI / File</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                statusMessage.type === "success"
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                  : "border-red-500/40 bg-red-950/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{statusMessage.type === "success" ? "✓" : "⚠"}</span>
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-white/40 hover:text-white ml-2 text-sm"
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
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Stream Protocol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rtsp", "http", "https"] as const).map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => {
                        setProtocol(proto);
                        if (proto === "rtsp" && (port === "8080" || port === "80")) setPort("554");
                        if (proto === "http" && port === "554") setPort("8080");
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 ${
                        protocol === proto
                          ? "border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                          : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="uppercase">{proto}</span>
                      <span className="text-[9px] text-white/40">
                        {proto === "rtsp" ? "(Default CCTV)" : proto === "http" ? "(Web/MJPEG)" : "(TLS)"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IP Address and Port Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Camera IP Address or Hostname <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. 192.168.1.100 or cam01.local"
                    className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Port <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={protocol === "rtsp" ? "554" : "8080"}
                    className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>
              </div>

              {/* Stream Path & Facility Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Stream Path / Channel (Optional)
                  </label>
                  <input
                    type="text"
                    value={streamPath}
                    onChange={(e) => setStreamPath(e.target.value)}
                    placeholder="/live or /h264 or /video"
                    className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Zone Location Label
                  </label>
                  <input
                    type="text"
                    value={facilityZone}
                    onChange={(e) => setFacilityZone(e.target.value)}
                    placeholder="e.g. Concourse A • Turnstiles"
                    className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>
              </div>

              {/* Optional Camera Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Camera Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  placeholder="e.g. South Transit Hub Camera 04"
                  className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                />
              </div>

              {/* Camera Authentication Collapsible */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.01] p-3">
                <button
                  type="button"
                  onClick={() => setShowAuth((prev) => !prev)}
                  className="flex items-center justify-between w-full text-[10px] font-mono text-white/70 hover:text-white"
                >
                  <span className="flex items-center gap-1.5">
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
                  <span className="text-white/40">{showAuth ? "▲ Hide" : "▼ Show Credentials"}</span>
                </button>

                {showAuth && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-white/50 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full rounded border border-white/[0.08] bg-black/60 px-2.5 py-1.5 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-white/50 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded border border-white/[0.08] bg-black/60 px-2.5 py-1.5 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Resolved Preview Card */}
              {constructedUri && (
                <div className="rounded-lg border border-white/[0.08] bg-black/50 p-2.5 font-mono text-[10.5px]">
                  <div className="text-white/40 uppercase text-[8.5px] mb-1">Ingestion Stream URI</div>
                  <div className="text-cyan-300 break-all">{constructedUri}</div>
                </div>
              )}

              {/* Test Reachability Result */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-lg border text-[10.5px] font-mono flex items-center gap-2 ${
                    testResult.reachable
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                      : "border-amber-500/40 bg-amber-950/30 text-amber-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${testResult.reachable ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !ip.trim()}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-[10.5px] font-mono uppercase tracking-wider text-white/70 hover:border-white/25 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTesting ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Testing Port...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Test IP &amp; Port</span>
                    </>
                  )}
                </button>

                <LiquidGlassButton
                  type="submit"
                  disabled={isSwitching || !ip.trim()}
                  size="sm"
                  className="font-mono text-xs tracking-wider border-cyan-400/40 text-cyan-300 hover:bg-cyan-950/40"
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
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-2">
                    Recent IP Cameras
                  </div>
                  <div className="space-y-1.5">
                    {savedCameras.map((cam) => (
                      <div
                        key={cam.id}
                        onClick={() => handleLoadSavedCamera(cam)}
                        className="group flex items-center justify-between p-2 rounded-lg border border-white/[0.05] bg-white/[0.01] hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all cursor-pointer font-mono text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400">🌐</span>
                          <span className="text-white/90 group-hover:text-cyan-300">{cam.name}</span>
                          <span className="text-[9px] text-white/40">
                            ({cam.ip}:{cam.port})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase text-white/40">{cam.zone}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentCamera(cam.id, e)}
                            className="text-white/20 hover:text-red-400 transition-colors p-1"
                            title="Remove"
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
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
                  <span>Local Hardware Sensors</span>
                  <span className="text-white/25">(Webcams &amp; Capture Cards)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(sourcesData?.interfaces || [
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
                  ]).map((item) => {
                    const isCurrent = stats.camera_source?.includes(`(${item.source})`) || stats.camera_source === item.name;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-white/[0.08] text-white/60 bg-black/40">
                              Device Index {item.source}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">
                                Active Sensor
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-mono font-medium text-white">{item.name}</h4>
                          <p className="text-[10px] text-white/40 font-sans mt-0.5 leading-snug">
                            {item.description || item.zone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectPreset(item)}
                          disabled={isSwitching || isCurrent}
                          className={`mt-1 py-1.5 px-3 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-all text-center ${
                            isCurrent
                              ? "border-emerald-500/30 text-emerald-300 opacity-60 cursor-default"
                              : "border-white/[0.1] bg-white/[0.03] text-white/80 hover:border-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-950/30"
                          }`}
                        >
                          {isCurrent ? "Currently Streaming" : "Switch to Device"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pre-configured CCTV Nodes */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center justify-between">
                  <span>Pre-Configured CCTV Camera Nodes</span>
                  <span className="text-white/30 text-[9px]">RTSP / HTTP Network Nodes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(sourcesData?.presets || [
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
                  ]).map((preset) => {
                    const isCurrent =
                      stats.camera_ip === preset.ip && Number(stats.camera_port) === preset.port;
                    return (
                      <div
                        key={preset.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                              {preset.ip}:{preset.port}
                            </span>
                            <span className="text-[9px] font-mono uppercase text-white/40">
                              {preset.protocol}
                            </span>
                          </div>
                          <h4 className="text-xs font-mono font-medium text-white">{preset.name}</h4>
                          <p className="text-[10px] text-cyan-300/80 font-mono mt-0.5 truncate">
                            {preset.zone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          disabled={isSwitching || isCurrent}
                          className={`mt-1 py-1.5 px-3 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-all text-center ${
                            isCurrent
                              ? "border-emerald-500/30 text-emerald-300 opacity-60 cursor-default"
                              : "border-white/[0.1] bg-white/[0.03] text-white/80 hover:border-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-950/30"
                          }`}
                        >
                          {isCurrent ? "Currently Streaming" : "Switch to Node"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT URI OR FILE */}
          {activeTab === "custom_uri" && (
            <form onSubmit={handleSwitchByUri} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Stream URI / Video File Path <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customUri}
                  onChange={(e) => setCustomUri(e.target.value)}
                  placeholder="rtsp://192.168.1.50:554/live or /path/to/cctv_test.mp4"
                  className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                />
                <p className="mt-1.5 text-[10px] text-white/40 font-mono">
                  Accepts complete RTSP stream links, HTTP MJPEG endpoints, or local looping video file paths.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Facility Zone Label
                </label>
                <input
                  type="text"
                  value={facilityZone}
                  onChange={(e) => setFacilityZone(e.target.value)}
                  placeholder="e.g. Custom Stream Zone • Concourse 04"
                  className="w-full rounded-lg border border-white/[0.12] bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/25 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-white/[0.08]">
                <LiquidGlassButton
                  type="submit"
                  disabled={isSwitching || !customUri.trim()}
                  size="sm"
                  className="font-mono text-xs tracking-wider border-cyan-400/40 text-cyan-300 hover:bg-cyan-950/40"
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
        <div className="border-t border-white/[0.08] px-5 py-2.5 bg-black/40 flex items-center justify-between text-[9px] font-mono text-white/40">
          <span>Target Backend: {backendUrl}</span>
          <span>Zero-Latency Ingestion Pipeline</span>
        </div>
      </div>
    </div>
  );
}
