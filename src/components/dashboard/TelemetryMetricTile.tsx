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
 * Clean, modern metric tile with aesthetic typography,
 * high-contrast value, quiet label, and subtle subtitle.
 */
export default function TelemetryMetricTile({
  label,
  value,
  unit,
  unitColor = "text-white/50",
  subtitle,
  valueColor = "text-white",
  className = "",
}: TelemetryMetricTileProps) {
  return (
    <div className={`p-3 flex flex-col justify-between ${className}`}>
      <span className="text-[11px] font-sans font-medium text-white/50 truncate">
        {label}
      </span>
      <div className="my-1 flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-semibold tracking-tight font-sans ${valueColor}`}
        >
          {value}
        </span>
        {unit && (
          <span className={`text-xs font-sans font-normal ${unitColor}`}>
            {unit}
          </span>
        )}
      </div>
      <span className="text-[10px] font-sans text-white/35 truncate">
        {subtitle}
      </span>
    </div>
  );
}
