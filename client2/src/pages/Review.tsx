import { useParams } from "react-router-dom";
import { useState } from "react";
import PdfViewer from "../components/PdfViewer";
import AssistantPanel from "../components/AssistantPanel";
import FloatingAssistantButton from "../components/FloatingAssistantButton";

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(true); // Assistant visible by default on review page
  const demoText = "Abstract: We propose a decentralized peer review platform using token staking... Methods: ... Results: ... Conclusion: ...";

  // Hard-code a doc URL for now; swap with IPFS link once wired
  const pdfUrl = "https://arxiv.org/pdf/1706.03762.pdf";

  return (
    <main className="page review-surface">
      <div className="review-left">
        <div className="muted small">Reviewing: <strong>{id}</strong></div>
        <PdfViewer url={pdfUrl} />
      </div>
      <AssistantPanel open={open} onClose={() => setOpen(false)} paperText={demoText} />
      {!open && <FloatingAssistantButton onOpen={() => setOpen(true)} />}
    </main>
  );
}
