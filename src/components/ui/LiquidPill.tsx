import React, { forwardRef } from "react";

export interface LiquidPillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "alert" | "success" | "cyan" | "warning";
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
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const sizeWrapperClasses = {
      xs: "px-2 py-0.5 rounded-md",
      sm: "px-2.5 py-1 rounded-md",
      md: "px-4 py-1.5 rounded-full shadow-sm",
      lg: "px-5 py-2 rounded-full shadow-sm",
    }[size];

    const variantClasses = {
      default:
        size === "md" || size === "lg"
          ? "border-white/10 bg-black/40 text-gray-400"
          : "border-white/[0.08] bg-black/50 text-white/90",
      alert: "border-red-500/25 bg-red-950/40 text-red-300",
      success: "border-emerald-500/25 bg-emerald-950/40 text-emerald-300",
      cyan: "border-cyan-500/25 bg-cyan-950/40 text-cyan-300",
      warning: "border-amber-500/25 bg-amber-950/40 text-amber-300",
    }[variant];

    const defaultTextClasses = {
      xs: "text-[9px] font-mono tracking-wider",
      sm: "text-[10px] font-mono tracking-wider",
      md: "text-[11px] sm:text-xs font-mono tracking-[0.22em] text-gray-400 uppercase",
      lg: "text-xs sm:text-sm font-mono tracking-[0.25em] text-gray-400 uppercase",
    }[size];

    return (
      <div
        ref={ref}
        className={`inline-flex items-center gap-2 border backdrop-blur-md select-none ${sizeWrapperClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {icon && <span className="flex items-center shrink-0">{icon}</span>}
        {typeof children === "string" ? (
          <span className={`${defaultTextClasses} ${textClassName}`}>
            {children}
          </span>
        ) : (
          children
        )}
      </div>
    );
  }
);

LiquidPill.displayName = "LiquidPill";

export default LiquidPill;
