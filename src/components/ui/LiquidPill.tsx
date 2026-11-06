import React, { forwardRef } from "react";

export interface LiquidPillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

/**
 * LiquidPill
 *
 * Minimalist dark glass capsule pill component.
 * Features subtle translucent black backing, thin silver border,
 * backdrop blur, and spaced monospace typography.
 */
const LiquidPill = forwardRef<HTMLDivElement, LiquidPillProps>(
  (
    {
      children,
      className = "",
      textClassName = "",
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-sm select-none ${className}`}
        {...props}
      >
        {icon && <span className="flex items-center shrink-0">{icon}</span>}
        <span
          className={`text-[11px] sm:text-xs font-mono tracking-[0.22em] text-gray-400 uppercase ${textClassName}`}
        >
          {children}
        </span>
      </div>
    );
  }
);

LiquidPill.displayName = "LiquidPill";

export default LiquidPill;
