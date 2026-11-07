"use client";

import React, { useState } from "react";
import {
  LiquidGlassButton,
  GlassInput,
  LiquidInnerCard,
} from "@/src/components/ui";
import { SavedCamera } from "./types";

export interface CameraNetworkStreamTabProps {
  protocol: "rtsp" | "http" | "https";
  setProtocol: (proto: "rtsp" | "http" | "https") => void;
  ip: string;
  setIp: (ip: string) => void;
  port: string;
  setPort: (port: string) => void;
  streamPath: string;
  setStreamPath: (path: string) => void;
  cameraName: string;
  setCameraName: (name: string) => void;
  facilityZone: string;
  setFacilityZone: (zone: string) => void;
  username: string;
  setUsername: (u: string) => void;
  password: string;
  setPassword: (p: string) => void;
  showAdvanced?: boolean;
  setShowAdvanced?: React.Dispatch<React.SetStateAction<boolean>>;
  showAuth?: boolean;
  setShowAuth?: React.Dispatch<React.SetStateAction<boolean>>;
  constructedUri: string;
  isTesting: boolean;
  isSwitching: boolean;
  onTestConnection: () => void;
  onSubmit: (e: React.FormEvent) => void;
  savedCameras: SavedCamera[];
  onLoadSavedCamera: (cam: SavedCamera) => void;
  onDeleteSavedCamera: (id: string, e: React.MouseEvent) => void;
}

/**
 * CameraNetworkStreamTab
 *
 * Form for configuring and connecting to an IP camera stream via RTSP/HTTP/HTTPS.
 * Includes network protocol switcher, IP/port inputs, live URI preview,
 * advanced stream credentials accordion, and saved recent streams list.
 */
export default function CameraNetworkStreamTab({
  protocol,
  setProtocol,
  ip,
  setIp,
  port,
  setPort,
  streamPath,
  setStreamPath,
  cameraName,
  setCameraName,
  facilityZone,
  setFacilityZone,
  username,
  setUsername,
  password,
  setPassword,
  showAdvanced,
  setShowAdvanced,
  showAuth,
  setShowAuth,
  constructedUri,
  isTesting,
  isSwitching,
  onTestConnection,
  onSubmit,
  savedCameras,
  onLoadSavedCamera,
  onDeleteSavedCamera,
}: CameraNetworkStreamTabProps) {
  const [localShowAdvanced, setLocalShowAdvanced] = useState(false);
  const [localShowAuth, setLocalShowAuth] = useState(false);

  const isAdvanced = showAdvanced !== undefined ? showAdvanced : localShowAdvanced;
  const toggleAdvanced = () => {
    if (setShowAdvanced) setShowAdvanced((p) => !p);
    else setLocalShowAdvanced((p) => !p);
  };

  const isAuth = showAuth !== undefined ? showAuth : localShowAuth;
  const toggleAuth = () => {
    if (setShowAuth) setShowAuth((p) => !p);
    else setLocalShowAuth((p) => !p);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Protocol Segmented Pill */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-white/90 font-sans tracking-tight">
            Network Protocol
          </h3>
          <p className="text-[11px] text-white/40 font-sans mt-0.5">
            Select transmission protocol for your camera or phone stream
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md gap-1">
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
                className={`px-3.5 py-1 rounded-lg text-xs font-mono font-medium transition-all select-none ${
                  isSelected
                    ? "bg-white/[0.1] text-white border border-white/25"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {proto.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* IP Address and Port Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8">
          <GlassInput
            label="Camera Address"
            labelExtra="Wi-Fi IP or Local Hostname"
            requiredIndicator
            required
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="e.g. 192.168.29.193 or cam01.local"
          />
        </div>

        <div className="sm:col-span-4">
          <GlassInput
            label="Port"
            labelExtra={protocol === "rtsp" ? "Default: 554" : "Default: 8080"}
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

      {/* Live Preview Pill (LiquidInnerCard) */}
      {constructedUri && (
        <LiquidInnerCard className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-white/40 text-[10.5px] uppercase tracking-wider shrink-0 font-sans">
              Stream Preview:
            </span>
            <span className="text-white/90 truncate select-all">
              {constructedUri}
            </span>
          </div>
          <span className="text-[10px] text-white/30 shrink-0 font-sans">
            Auto-Generated
          </span>
        </LiquidInnerCard>
      )}

      {/* Collapsible Advanced Stream Configuration */}
      <LiquidInnerCard className="p-3 transition-colors">
        <button
          type="button"
          onClick={toggleAdvanced}
          className="flex items-center justify-between w-full text-xs font-sans font-medium text-white/70 hover:text-white transition-colors select-none"
        >
          <span className="flex items-center gap-2">
            <span className="text-white/40">⚙</span>
            <span>Optional Stream Details &amp; Authentication</span>
          </span>
          <span className="text-[11px] text-white/40">
            {isAdvanced ? "Hide Details ▲" : "Configure path & login ▼"}
          </span>
        </button>

        {isAdvanced && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassInput
                label="Stream Path / Channel"
                labelExtra="Default: /live"
                type="text"
                value={streamPath}
                onChange={(e) => setStreamPath(e.target.value)}
                placeholder="/live or /h264 or /video"
              />
              <GlassInput
                label="Zone Location Label"
                labelExtra="Optional"
                type="text"
                value={facilityZone}
                onChange={(e) => setFacilityZone(e.target.value)}
                placeholder="Terminal Concourse 04 • Zone B"
              />
            </div>

            <GlassInput
              label="Camera Display Name"
              labelExtra="Optional"
              type="text"
              value={cameraName}
              onChange={(e) => setCameraName(e.target.value)}
              placeholder="e.g. South Transit Hub Camera 04"
            />

            {/* Authentication Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleAuth}
                className="flex items-center justify-between w-full text-[11px] font-sans text-white/50 hover:text-white/80 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Camera Login Credentials (Optional)</span>
                </span>
                <span>{isAuth ? "▲" : "▼"}</span>
              </button>

              {isAuth && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
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
          </div>
        )}
      </LiquidInnerCard>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1 gap-3">
        <LiquidGlassButton
          type="button"
          onClick={onTestConnection}
          disabled={isTesting || !ip.trim()}
          size="sm"
          variant="subtle"
          className="font-sans text-xs tracking-tight font-medium"
          iconLeft={
            isTesting ? (
              <span className="h-2 w-2 rounded-full bg-white/70 animate-ping" />
            ) : (
              <span>⚡</span>
            )
          }
        >
          {isTesting ? "Testing Port..." : "Test Connection"}
        </LiquidGlassButton>

        <LiquidGlassButton
          type="submit"
          disabled={isSwitching || !ip.trim()}
          size="sm"
          variant="default"
          className="font-sans text-xs tracking-tight font-medium"
          iconRight={
            isSwitching ? (
              <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
            ) : (
              <span>↗</span>
            )
          }
        >
          {isSwitching ? "CONNECTING FEED..." : "CONNECT & STREAM"}
        </LiquidGlassButton>
      </div>

      {/* Saved / Recent IP Cameras */}
      {savedCameras.length > 0 && (
        <div className="pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70 font-sans tracking-tight">
              Recent Streams
            </span>
            <span className="text-white/40 text-[11px] font-sans">
              Click to quick-connect
            </span>
          </div>
          <div className="space-y-1.5">
            {savedCameras.map((cam) => (
              <LiquidInnerCard
                key={cam.id}
                onClick={() => onLoadSavedCamera(cam)}
                className="group flex items-center justify-between p-2.5 hover:border-white/20 transition-all cursor-pointer text-xs font-sans select-none"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-white/40">🌐</span>
                  <span className="text-white/95 group-hover:text-white font-medium truncate">
                    {cam.name || `${cam.ip}:${cam.port}`}
                  </span>
                  <span className="text-[11px] font-mono text-white/40 shrink-0">
                    ({cam.ip}:{cam.port})
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {cam.zone && (
                    <span className="text-[10px] text-white/40 uppercase tracking-wider hidden sm:inline">
                      {cam.zone}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => onDeleteSavedCamera(cam.id, e)}
                    className="text-white/30 hover:text-white p-1 transition-colors"
                    title="Remove from recents"
                  >
                    ✕
                  </button>
                </div>
              </LiquidInnerCard>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
