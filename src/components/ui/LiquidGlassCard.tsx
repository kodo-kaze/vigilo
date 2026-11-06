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
    return (
      <div
        ref={ref}
        className={`relative liquid-glass-card rounded-3xl sm:rounded-[36px] p-8 sm:p-11 shadow-[0_24px_70px_rgba(0,0,0,0.85)] ${className}`}
        {...props}
      >
        {/* Top Specular Inner Rim */}
        {hasTopSpecular && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />
        )}
        {children}
      </div>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";

export default LiquidGlassCard;
