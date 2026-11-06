"use client";

import React, { useState } from "react";

/**
 * Root Template
 *
 * Provides smooth liquid-glass page transitions on route changes.
 * Next.js App Router creates a new instance of template.tsx on every
 * navigation, ensuring the fluid entrance animation and top glow streak
 * trigger reliably across all page changes.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(true);

  return (
    <div
      className={`page-transition-wrapper ${
        isTransitioning ? "page-entering" : ""
      }`}
      onAnimationEnd={(e) => {
        if (
          e.animationName === "vigiloPageEnter" ||
          e.animationName === "vigiloPageFade"
        ) {
          setIsTransitioning(false);
        }
      }}
    >
      {isTransitioning && (
        <div className="page-transit-glow" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
