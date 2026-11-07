import React, { forwardRef } from "react";

export interface LiquidInnerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hasSpecular?: boolean;
}

/**
 * LiquidInnerCard
 *
 * Darker recessed liquid glass sub-card for nested sections,
 * telemetry grids, and specs wells inside LiquidGlassCards.
 */
const LiquidInnerCard = forwardRef<HTMLDivElement, LiquidInnerCardProps>(
  ({ children, className = "", hasSpecular = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-md ${
          hasSpecular
            ? "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.35)]"
            : "shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LiquidInnerCard.displayName = "LiquidInnerCard";

export default LiquidInnerCard;
