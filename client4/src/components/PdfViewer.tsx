"use client";

import { useCallback, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Worker (CDN is simplest for Vite dev; swap to a local worker if you prefer)
pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  /** PDF URL (can be https://ipfs.io/ipfs/<cid> or any public URL) */
  url: string;
  /** Render width per page (px). If not provided, auto-fits container width up to 1100px */
  width?: number;
  /** Optional initial page scale (1 = 100%) */
  scale?: number;
  /** Optional className for the outer container */
  className?: string;
};

export default function PdfViewer({
  url,
  width,
  scale = 1,
  className = "",
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);

  const onLoad = useCallback((info: { numPages: number }) => {
    setNumPages(info.numPages);
    setErr(null);
  }, []);

  const pageWidth = useMemo(() => {
    if (typeof width === "number" && width > 0) return width;
    // Auto-fit up to a max width to avoid super-wide pages
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    return Math.min(Math.floor(vw - 64), 1100); // viewport - padding, cap at 1100
  }, [width]);

  return (
    <div
      className={
        "rounded-2xl border border-border bg-card/60 overflow-auto max-h-[calc(100vh-160px)] " +
        className
      }
    >
      <Document
        file={url}
        onLoadSuccess={onLoad}
        onLoadError={(e) => setErr(e?.message || "Failed to load PDF")}
        loading={<LoadingSkeleton />}
        error={<ErrorBox message={err ?? "Failed to load PDF"} fallbackUrl={url} />}
        options={{ cMapUrl: "/cmaps/", cMapPacked: true }} // safe defaults; optional
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
          <Page
            key={n}
            pageNumber={n}
            width={pageWidth}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto my-4"
          />
        ))}
      </Document>
    </div>
  );
}

function LoadingSkeleton() {
  // Simple shimmering blocks while PDF loads
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-48 w-[min(90vw,1100px)] mx-auto animate-pulse rounded-xl bg-foreground/10"
        />
      ))}
    </div>
  );
}

function ErrorBox({ message, fallbackUrl }: { message: string; fallbackUrl: string }) {
  return (
    <div className="p-6 text-sm">
      <div className="mb-2 font-semibold">Couldn’t render the PDF</div>
      <div className="opacity-80 mb-3">{message}</div>
      <a
        href={fallbackUrl}
        target="_blank"
        rel="noreferrer"
        className="underline hover:no-underline"
      >
        Open directly
      </a>
    </div>
  );
}
