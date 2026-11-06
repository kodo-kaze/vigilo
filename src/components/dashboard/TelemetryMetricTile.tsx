import React from "react";

export interface TelemetryMetricTileProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  unitColor?: string;
  subtitle: string;
  valueColor?: string;
  className?: string;
}

/**
 * TelemetryMetricTile
 *
 * Minimalist bento metric tile with hairline borders,
 * uppercase technical label, bold monospace value, and subtle subtitle.
 */
export default function TelemetryMetricTile({
  label,
  value,
  unit,
  unitColor = "text-white/60",
  subtitle,
  valueColor = "text-white",
  className = "",
}: TelemetryMetricTileProps) {
  return (
    <div
      className={`rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 flex flex-col justify-between ${className}`}
    >
      <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase truncate">
        {label}
      </span>
      <div className="my-0.5 flex items-baseline gap-1">
        <span
          className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${valueColor}`}
        >
          {value}
        </span>
        {unit && (
          <span className={`text-[9px] font-mono ${unitColor}`}>{unit}</span>
        )}
      </div>
      <span className="text-[8px] font-mono text-white/35 truncate">
        {subtitle}
      </span>
    </div>
  );
}
