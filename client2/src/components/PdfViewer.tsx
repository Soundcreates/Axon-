import { useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ url }: { url: string }) {
  useEffect(() => { /* noop */ }, [url]);
  return (
    <div className="pdf-wrapper">
      <Document file={url} loading={<div className="pdf-loading">Loading PDF…</div>}>
        <Page pageNumber={1} width={820} />
      </Document>
    </div>
  );
}
