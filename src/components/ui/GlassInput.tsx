"use client";

import React, { forwardRef } from "react";

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  requiredIndicator?: boolean;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerClassName?: string;
}

/**
 * GlassInput
 *
 * Modern ultra-translucent liquid glass input field.
 * Features smoked obsidian glass backing, minimal hairline silver border,
 * subtle cyan glow on focus, and clean high-legibility typography.
 */
const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      labelExtra,
      requiredIndicator = false,
      helperText,
      iconLeft,
      iconRight,
      containerClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ||
      (typeof label === "string"
        ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="flex items-center gap-1.5 text-xs font-medium text-white/85 font-sans tracking-tight select-none"
            >
              <span>{label}</span>
              {requiredIndicator && <span className="text-cyan-400 font-bold">*</span>}
            </label>
            {labelExtra && (
              <span className="text-[11px] text-white/40 font-sans font-normal">
                {labelExtra}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="pointer-events-none absolute left-3 flex items-center text-white/40">
              {iconLeft}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/25 backdrop-blur-md transition-all duration-200 hover:border-white/15 hover:bg-white/[0.04] focus:border-cyan-400/60 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed ${
              iconLeft ? "pl-9" : ""
            } ${iconRight ? "pr-9" : ""} ${className}`}
            {...props}
          />
          {iconRight && (
            <span className="pointer-events-none absolute right-3 flex items-center text-white/40">
              {iconRight}
            </span>
          )}
        </div>
        {helperText && (
          <span className="text-[10.5px] text-white/40 font-sans leading-snug">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export default GlassInput;
