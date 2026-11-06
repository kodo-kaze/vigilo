"use client";

import React, { forwardRef } from "react";
import Link from "next/link";

export interface LiquidGlassButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "cyan" | "subtle";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  showArrow?: boolean;
  external?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
  hasSheen?: boolean;
  id?: string;
  title?: string;
  "aria-label"?: string;
}

/**
 * LiquidGlassButton
 *
 * Modern ultra-transparent, high-refraction liquid glass button.
 * Renders as a Next.js <Link>, an external <a>, or a <button>.
 * Features signature liquid sheen sweep on hover and smooth micro-interactions.
 */
const LiquidGlassButton = forwardRef<HTMLElement, LiquidGlassButtonProps>(
  (
    {
      children,
      href,
      onClick,
      type = "button",
      className = "",
      size = "md",
      variant = "default",
      iconLeft,
      iconRight,
      showArrow = false,
      external = false,
      disabled = false,
      target,
      rel,
      hasSheen = true,
      ...rest
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-5 py-2 text-xs gap-2",
      md: "px-7 py-3 text-sm gap-2.5",
      lg: "px-9 py-3.5 text-sm gap-3",
    }[size];

    const variantClasses = {
      default: "",
      cyan: "border-cyan-400/35 hover:border-cyan-400/60",
      subtle: "border-white/10 bg-white/[0.04]",
    }[variant];

    const baseClasses = `liquid-glass-btn group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium tracking-wide text-white select-none transition-all duration-300 hover:scale-[1.025] active:scale-[0.985] ${sizeClasses} ${variantClasses} ${className}`;

    const defaultArrow = (
      <svg
        className="relative z-10 h-4 w-4 text-white/90 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    );

    const content = (
      <>
        {/* Dynamic sheen sweep on hover */}
        {hasSheen && (
          <span className="pointer-events-none absolute -left-full top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />
        )}

        {/* Left Icon */}
        {iconLeft && (
          <span className="relative z-10 flex items-center shrink-0">
            {iconLeft}
          </span>
        )}

        {/* Button Label */}
        <span className="relative z-10 font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {children}
        </span>

        {/* Right Icon or Default Arrow */}
        {iconRight ? (
          <span className="relative z-10 flex items-center shrink-0">
            {iconRight}
          </span>
        ) : showArrow ? (
          defaultArrow
        ) : null}
      </>
    );

    // If external link or explicit URL protocol
    if (href && (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"))) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          onClick={onClick}
          className={baseClasses}
          {...rest}
        >
          {content}
        </a>
      );
    }

    // If anchor link (#id)
    if (href && href.startsWith("#")) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          className={baseClasses}
          {...rest}
        >
          {content}
        </a>
      );
    }

    // If internal route Link
    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          className={baseClasses}
          {...rest}
        >
          {content}
        </Link>
      );
    }

    // Standard button element
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

LiquidGlassButton.displayName = "LiquidGlassButton";

export default LiquidGlassButton;
