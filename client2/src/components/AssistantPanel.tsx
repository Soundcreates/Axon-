import { useEffect, useRef, useState } from "react";
import { X, ChevronRight, Sparkles, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FlagItem = { issue: string; page?: number; severity?: "low"|"med"|"high" };

export default function AssistantPanel({
  open, onClose, paperText
}: { open: boolean; onClose: () => void; paperText: string }) {
  const [summary, setSummary] = useState<string>("");
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [thinking, setThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    setThinking(true);
    setSummary("");
    setFlags([]);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // fake “analysis” locally (you can swap to /api/assistant if needed)
    const t = setTimeout(() => {
      setSummary(
        "This paper proposes a token-aligned peer review workflow. Strengths: transparent incentives, clear on-chain accountability. Risks: incentive gaming, reviewer collusion, unclear governance on disputes."
      );
      setFlags([
        { issue: "Missing dataset license mention", page: 6, severity: "med" },
        { issue: "Ethics / human subjects statement absent", page: 11, severity: "high" },
        { issue: "Reproducibility lacking exact seeds", page: 13, severity: "low" },
      ]);
      setThinking(false);
    }, 900);

    return () => { clearTimeout(t); ac.abort(); };
  }, [open, paperText]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
          className="assistant"
        >
          <div className="assistant-head">
            <div className="title"><Sparkles size={16}/> Axon Assistant</div>
            <button className="icon-btn" onClick={onClose}><X size={16}/></button>
          </div>

          <div className="assistant-section">
            <div className="section-title">Summary</div>
            <div className="summary">
              {thinking ? "Analyzing manuscript…" : summary || "—"}
            </div>
          </div>

          <div className="assistant-section">
            <div className="section-title">Red Flags</div>
            <ul className="flags">
              {flags.map((f, i) => (
                <li key={i} className={`flag flag-${f.severity ?? "low"}`}>
                  <Flag size={14}/> <span>{f.issue}</span>
                  {f.page ? <span className="muted"> · p.{f.page}</span> : null}
                </li>
              ))}
              {!thinking && flags.length === 0 && <li className="muted">No issues detected.</li>}
            </ul>
          </div>

          <div className="assistant-cta">
            <button className="pill primary small">Ask a question <ChevronRight size={14}/></button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
