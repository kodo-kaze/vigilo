import React, { forwardRef } from "react";

export interface LiquidGlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hasTopSpecular?: boolean;
}

/**
 * LiquidGlassCard
 *
 * Modern ultra-transparent, high-refraction liquid glass card.
 * Features smoked obsidian backing, ambient glass border refraction,
 * and an optional top specular reflection line.
 */
const LiquidGlassCard = forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  (
    {
      children,
      className = "",
      hasTopSpecular = true,
      ...props
    },
    ref
  ) => {
    // If consumer specifies custom padding (e.g. p-0, p-5, px-), don't inject default large card padding
    const hasCustomPadding = /\bp[xytrbl]?-/.test(className);
    const defaultPadding = hasCustomPadding ? "" : "p-8 sm:p-11";
    const defaultRounded = /\brounded-/.test(className) ? "" : "rounded-2xl sm:rounded-3xl";

    return (
      <div
        ref={ref}
        className={`relative liquid-glass-card overflow-hidden ${defaultRounded} ${defaultPadding} shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${className}`}
        {...props}
      >
        {/* Top Specular Inner Rim */}
        {hasTopSpecular && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
        {children}
      </div>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";

export default LiquidGlassCard;
