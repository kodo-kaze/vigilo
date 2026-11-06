import React from "react";

export interface TelemetryStripProps {
  /** Array of telemetry status strings or nodes */
  items: React.ReactNode[];
  /** Delimiter element placed between items; defaults to "/" */
  delimiter?: React.ReactNode;
  /** Whether to show subtle top and bottom borders */
  bordered?: boolean;
  /** Alignment of telemetry items */
  align?: "center" | "left" | "between";
  /** Optional custom styling classes */
  className?: string;
}

/**
 * TelemetryStrip
 *
 * Industrial monospace technical readout with slash delimiters.
 * Free of artificial AI indicators, featuring high-clarity typography.
 */
export default function TelemetryStrip({
  items,
  delimiter = "/",
  bordered = true,
  align = "center",
  className = "",
}: TelemetryStripProps) {
  const justifyClass = {
    center: "justify-center",
    left: "justify-start",
    between: "justify-between",
  }[align];

  return (
    <div
      className={`flex flex-wrap items-center ${justifyClass} gap-3 sm:gap-5 py-2.5 font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase select-none ${
        bordered ? "border-y border-white/10" : ""
      } ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-300 font-medium transition-colors hover:text-white">
            {item}
          </span>
          {index < items.length - 1 && (
            <span className="text-white/20 select-none" aria-hidden="true">
              {delimiter}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
