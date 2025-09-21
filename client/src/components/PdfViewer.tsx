"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url, width = 860 }: { url: string; width?: number }) {
  const [numPages, setNumPages] = useState(0);
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-auto max-h-[calc(100vh-160px)]">
      <Document file={url} onLoadSuccess={(p) => setNumPages(p.numPages)}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
          <Page
            key={n}
            pageNumber={n}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto my-4"
          />
        ))}
      </Document>
    </div>
  );
}
