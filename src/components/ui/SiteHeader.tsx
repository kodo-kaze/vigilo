import React from "react";
import BrandLogo from "./BrandLogo";
import LiquidGlassButton from "./LiquidGlassButton";

export interface SiteHeaderProps {
  /** Target link for back action */
  backHref?: string;
  /** Label for back action button */
  backLabel?: string;
  /** Optional custom right-hand action element */
  rightElement?: React.ReactNode;
  /** Extra container classes */
  className?: string;
}

/**
 * SiteHeader
 *
 * Minimalist translucent glass top bar with Vigilo brand mark
 * and customizable navigation action.
 */
export default function SiteHeader({
  backHref = "/",
  backLabel = "BACK TO HOME",
  rightElement,
  className = "",
}: SiteHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between border-b border-white/10 py-7 select-none ${className}`}
    >
      <BrandLogo href="/" size="md" />

      {rightElement || (
        <LiquidGlassButton
          href={backHref}
          size="sm"
          className="font-mono text-xs tracking-widest"
          iconRight={
            <svg
              className="h-3.5 w-3.5 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          }
        >
          {backLabel}
        </LiquidGlassButton>
      )}
    </header>
  );
}
