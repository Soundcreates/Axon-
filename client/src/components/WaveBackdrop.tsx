"use client";
export default function WaveBackdrop({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`wave-bg ${className}`} />;
}
