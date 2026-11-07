"use client";

import React from "react";
import { GlassInput, LiquidGlassButton, LiquidInnerCard } from "@/src/components/ui";

export interface CameraCustomUriTabProps {
  customUri: string;
  setCustomUri: (uri: string) => void;
  facilityZone: string;
  setFacilityZone: (zone: string) => void;
  isSwitching: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * CameraCustomUriTab
 *
 * Tab for direct connection via arbitrary streaming endpoints
 * (RTSP, HTTP/MJPEG, HLS, or local looping video file paths).
 */
export default function CameraCustomUriTab({
  customUri,
  setCustomUri,
  facilityZone,
  setFacilityZone,
  isSwitching,
  onSubmit,
}: CameraCustomUriTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <GlassInput
          label="Stream URL or Video File Path"
          requiredIndicator
          required
          type="text"
          value={customUri}
          onChange={(e) => setCustomUri(e.target.value)}
          placeholder="rtsp://192.168.1.50:554/live or /path/to/cctv_test.mp4"
          helperText="Supports live RTSP links, HTTP MJPEG endpoints, or local looping video file paths."
        />

        {/* Quick Template Chips (LiquidInnerCard) */}
        <LiquidInnerCard className="flex flex-wrap items-center gap-2 mt-2.5 p-2.5">
          <span className="text-[11px] text-white/50 font-sans font-medium">
            Quick Templates:
          </span>
          <button
            type="button"
            onClick={() => setCustomUri("rtsp://192.168.1.100:554/live")}
            className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10.5px] font-mono text-white/70 hover:border-white/20 hover:text-white transition-colors"
          >
            + RTSP Stream
          </button>
          <button
            type="button"
            onClick={() => setCustomUri("http://192.168.1.45:8080/video")}
            className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10.5px] font-mono text-white/70 hover:border-white/20 hover:text-white transition-colors"
          >
            + Phone IP Webcam
          </button>
        </LiquidInnerCard>
      </div>

      <GlassInput
        label="Facility Zone Label"
        labelExtra="Optional"
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
          {isSwitching ? "CONNECTING STREAM..." : "CONNECT STREAM"}
        </LiquidGlassButton>
      </div>
    </form>
  );
}
