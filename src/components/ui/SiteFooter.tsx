import React from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

export interface SiteFooterProps {
  /** Optional custom slogan/tagline */
  tagline?: string;
  /** Return link label */
  returnLabel?: string;
  /** Return link target URL */
  returnHref?: string;
  /** Extra classes */
  className?: string;
}

/**
 * SiteFooter
 *
 * Unified global footer component displaying the Vigilo brand mark,
 * industrial monospace slogan, and clean directional return anchor.
 */
export default function SiteFooter({
  tagline = "BUILT WITH PURPOSE. POWERED BY INTELLIGENCE.",
  returnLabel = "Back to homepage",
  returnHref = "/",
  className = "",
}: SiteFooterProps) {
  return (
    <footer
      className={`flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-center sm:flex-row sm:text-left select-none ${className}`}
    >
      <BrandLogo href={returnHref} size="sm" showIcon={false} />

      <p className="text-[10px] tracking-wider text-white/40 font-mono">
        {tagline}
      </p>

      {returnHref && (
        <Link
          href={returnHref}
          className="group flex items-center gap-1.5 text-xs text-white/50 transition-colors duration-200 hover:text-white"
        >
          <span>{returnLabel}</span>
          <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
            ↑
          </span>
        </Link>
      )}
    </footer>
  );
}
