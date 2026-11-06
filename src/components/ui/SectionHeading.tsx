import React from "react";

export interface SectionHeadingProps {
  /** Numerical/category index indicator, e.g. "01 / OUR MISSION" */
  tag?: string;
  /** Primary headline */
  title?: React.ReactNode;
  /** Optional secondary descriptive paragraph */
  subtitle?: React.ReactNode;
  /** Alignment of text: default is "center" */
  align?: "center" | "left";
  /** Optional extra classes */
  className?: string;
}

/**
 * SectionHeading
 *
 * Industrial minimalist section header featuring monospace category tag,
 * high-contrast bold headline with subtle specular drop shadow, and descriptive subtitle.
 */
export default function SectionHeading({
  tag,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignmentClasses =
    align === "center"
      ? "text-center items-center mx-auto"
      : "text-left items-start";

  return (
    <div className={`flex flex-col ${alignmentClasses} ${className}`}>
      {tag && (
        <span className="mb-5 inline-block font-mono text-[10px] tracking-[0.4em] text-white/60 uppercase select-none">
          {tag}
        </span>
      )}

      {title && (
        <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-5xl md:text-6xl [text-wrap:balance]">
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={`mt-6 max-w-xl text-sm leading-7 text-white/70 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
