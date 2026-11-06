import React from "react";
import Link from "next/link";

export interface BrandLogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

/**
 * BrandLogo
 *
 * Minimalist Vigilo brand mark featuring high-refraction glass 'V' emblem
 * and tracked futuristic typography.
 */
export default function BrandLogo({
  href = "/",
  className = "",
  size = "md",
  showIcon = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7 text-sm rounded-lg",
    md: "h-9 w-9 text-lg rounded-xl",
    lg: "h-11 w-11 text-xl rounded-2xl",
  }[size];

  const textSizes = {
    sm: "text-sm tracking-[0.25em]",
    md: "text-lg tracking-[0.28em]",
    lg: "text-2xl tracking-[0.3em]",
  }[size];

  const content = (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {showIcon && (
        <div
          className={`flex ${iconSizes} items-center justify-center border border-white/20 bg-white/10 backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:border-white/35`}
        >
          <span className="font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            V
          </span>
        </div>
      )}
      <span className={`font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${textSizes}`}>
        VIGILO<span className="text-white/50">.</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
