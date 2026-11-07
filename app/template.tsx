"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Root Template
 *
 * Provides smooth, elegant liquid-glass page transitions on route changes.
 * Keyed by pathname to guarantee instant, reliable entrance animations,
 * fluid lens blur-focus, and specular top streak across all navigations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={`page-transition-wrapper ${
        isTransitioning ? "page-entering" : ""
      }`}
    >
      {isTransitioning && (
        <>
          <div className="page-transit-sheen" aria-hidden="true" />
          <div className="page-transit-glow" aria-hidden="true" />
        </>
      )}
      {children}
    </div>
  );
}
