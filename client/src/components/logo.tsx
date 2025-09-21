"use client";
import React from "react";

/**
 * Axon logo: modular neural-axon motif with token ring.
 * Scales crisply. The wordmark uses currentColor.
 */
export default function logo({ className = "", showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        {/* token ring */}
        <circle cx="32" cy="32" r="21" stroke="url(#g1)" strokeWidth="2.5" opacity="0.85"/>
        {/* axon body */}
        <path d="M12 36c6-8 13-12 20-12s14 4 20 12" stroke="url(#g1)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* synapse nodes */}
        <circle cx="12" cy="36" r="3" fill="hsl(var(--secondary))"/>
        <circle cx="32" cy="24" r="3" fill="hsl(var(--primary))"/>
        <circle cx="52" cy="36" r="3" fill="hsl(var(--accent))"/>
      </svg>
      {showWordmark && (
        <span className="font-extrabold tracking-tight text-xl leading-none">Axon</span>
      )}
    </div>
  );
}
