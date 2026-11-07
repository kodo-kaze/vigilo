"use client";

import React from "react";
import CameraSourceNodeCard from "./CameraSourceNodeCard";
import { CameraPreset, TelemetryStats } from "./types";

export interface CameraPresetsTabProps {
  interfaces: CameraPreset[];
  presets: CameraPreset[];
  stats: TelemetryStats;
  isSwitching: boolean;
  onSelectPreset: (preset: CameraPreset) => void;
}

const DEFAULT_INTERFACES: CameraPreset[] = [
  {
    id: "webcam-0",
    name: "Integrated HD Camera",
    type: "webcam",
    source: "0",
    zone: "Built-in Sensor • Main Desk",
    description: "System default optical sensor",
  },
  {
    id: "webcam-1",
    name: "External USB Camera",
    type: "webcam",
    source: "1",
    zone: "Auxiliary Ingest • Zone External",
    description: "USB peripheral optical device",
  },
];

const DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: "concourse-a",
    name: "Concourse A — Turnstiles",
    type: "ip_camera",
    source: "rtsp://192.168.1.101:554/live",
    ip: "192.168.1.101",
    port: 554,
    protocol: "rtsp",
    zone: "Terminal Concourse 04 • Gate South",
  },
  {
    id: "concourse-b",
    name: "Concourse B — Main Escalator Gate",
    type: "ip_camera",
    source: "rtsp://192.168.1.102:554/live",
    ip: "192.168.1.102",
    port: 554,
    protocol: "rtsp",
    zone: "Terminal Concourse 04 • Escalator Flow",
  },
  {
    id: "platform-3",
    name: "Platform 03 — Boarding Hall",
    type: "ip_camera",
    source: "rtsp://192.168.1.103:554/live",
    ip: "192.168.1.103",
    port: 554,
    protocol: "rtsp",
    zone: "Platform Hub • Level 2 North",
  },
  {
    id: "security-entry",
    name: "Security Checkpoint 01 Entry",
    type: "ip_camera",
    source: "http://192.168.1.104:8080/video",
    ip: "192.168.1.104",
    port: 8080,
    protocol: "http",
    zone: "North Terminal • Security Screening",
  },
];

/**
 * CameraPresetsTab
 *
 * Tab presenting local hardware webcam capture cards and
 * facility-wide pre-configured CCTV network surveillance nodes.
 */
export default function CameraPresetsTab({
  interfaces,
  presets,
  stats,
  isSwitching,
  onSelectPreset,
}: CameraPresetsTabProps) {
  const hardwareList = interfaces.length > 0 ? interfaces : DEFAULT_INTERFACES;
  const cctvList = presets.length > 0 ? presets : DEFAULT_PRESETS;

  return (
    <div className="space-y-5">
      {/* Local Hardware Interfaces */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-medium text-white/90 font-sans tracking-tight">
            Local Optical Sensors
          </h3>
          <span className="text-[11px] text-white/40 font-sans">
            Connected Webcams &amp; Capture Devices
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {hardwareList.map((item) => {
            const isCurrent =
              stats.camera_source?.includes(`(${item.source})`) ||
              stats.camera_source === item.name;
            return (
              <CameraSourceNodeCard
                key={item.id}
                name={item.name}
                description={item.zone || item.description}
                badge={`Device #${item.source}`}
                deviceType="webcam"
                isCurrent={isCurrent}
                isLoading={isSwitching}
                onSelect={() => onSelectPreset(item)}
              />
            );
          })}
        </div>
      </div>

      {/* Pre-configured CCTV Nodes */}
      <div className="pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-medium text-white/90 font-sans tracking-tight">
            Facility CCTV Nodes
          </h3>
          <span className="text-[11px] text-white/40 font-sans">
            Pre-Configured Network Surveillance
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cctvList.map((preset) => {
            const isCurrent =
              stats.camera_ip === preset.ip && stats.camera_port === preset.port;
            return (
              <CameraSourceNodeCard
                key={preset.id}
                name={preset.name}
                description={preset.zone}
                badge={`${(preset.protocol || "rtsp").toUpperCase()} • ${preset.port}`}
                deviceType="cctv"
                isCurrent={isCurrent}
                isLoading={isSwitching}
                onSelect={() => onSelectPreset(preset)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
