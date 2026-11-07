import React, { forwardRef } from "react";

export interface LiquidPillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  dotColor?: string;
  dotPulse?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "glass" | "alert" | "success" | "cyan" | "warning";
}

/**
 * LiquidPill
 *
 * Modern liquid glass capsule pill component.
 * Features translucent dark glass fill, crisp silver border refraction,
 * top specular highlight, backdrop blur, and aesthetic typography.
 */
const LiquidPill = forwardRef<HTMLDivElement, LiquidPillProps>(
  (
    {
      children,
      className = "",
      textClassName = "",
      icon,
      dotColor,
      dotPulse = false,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: "px-2.5 py-0.5 text-[10px] gap-1.5",
      sm: "px-3 py-1 text-[11px] gap-2",
      md: "px-3.5 py-1.5 text-xs gap-2",
      lg: "px-4.5 py-2 text-sm gap-2.5",
    }[size];

    const variantClasses = {
      default:
        "border-white/20 bg-black/60 text-white/95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]",
      glass:
        "border-white/20 bg-white/[0.04] text-white/95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]",
      alert:
        "border-red-500/30 bg-red-950/60 text-red-200 shadow-[inset_0_1px_1px_0_rgba(248,113,113,0.3),0_4px_16px_rgba(0,0,0,0.5)]",
      success:
        "border-emerald-500/30 bg-emerald-950/60 text-emerald-200 shadow-[inset_0_1px_1px_0_rgba(52,211,153,0.3),0_4px_16px_rgba(0,0,0,0.5)]",
      cyan:
        "border-cyan-500/30 bg-cyan-950/60 text-cyan-200 shadow-[inset_0_1px_1px_0_rgba(56,189,248,0.3),0_4px_16px_rgba(0,0,0,0.5)]",
      warning:
        "border-amber-500/30 bg-amber-950/60 text-amber-200 shadow-[inset_0_1px_1px_0_rgba(251,191,36,0.3),0_4px_16px_rgba(0,0,0,0.5)]",
    }[variant];

    const dotSizeClass = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full border backdrop-blur-xl font-sans select-none ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {dotColor && (
          <span
            className={`rounded-full shrink-0 ${dotSizeClass} ${dotColor} ${
              dotPulse ? "animate-pulse" : ""
            }`}
          />
        )}
        {icon && <span className="flex items-center shrink-0">{icon}</span>}
        {typeof children === "string" ? (
          <span className={`font-medium ${textClassName}`}>{children}</span>
        ) : (
          children
        )}
      </div>
    );
  }
);

LiquidPill.displayName = "LiquidPill";

export default LiquidPill;
