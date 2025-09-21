"use client";
import { useEffect, useRef, useState } from "react";
import { X, AlertTriangle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

type Flag = { issue: string; page?: number; severity?: "low" | "medium" | "high" };

type StreamMessage =
  | { kind: "section"; name: string; summary: string }
  | { kind: "status"; msg: string }
  | { kind: "red_flags"; items?: Flag[] } // items may be missing from the stream
  | { kind: "done" }
  | { kind: string; [k: string]: any }; // future-proofing

export function AssistantPanel({
  open,
  onClose,
  paperText,
  onNewFlags,
}: {
  open: boolean;
  onClose: () => void;
  paperText: string;
  onNewFlags?: (count: number) => void;
}) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    async function run() {
      setMessages([]);
      setFlags([]);

      try {
        const resp = await fetch("/assistant/sse-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: paperText }),
          signal: ctrl.signal,
        });

        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buf = "";
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;

          buf += decoder.decode(chunk.value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data:")) continue;
            const jsonStr = part.replace(/^data:\s*/, "");
            try {
              const msg = JSON.parse(jsonStr) as StreamMessage;
              setMessages((m) => [...m, msg]);

              if (msg.kind === "red_flags") {
                const items: Flag[] = Array.isArray(msg.items) ? msg.items : [];
                setFlags(items);                 // ✅ never undefined
                onNewFlags?.(items.length);      // ✅ never undefined
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch {
        // Fallback demo data if SSE/proxy not wired yet
        const demo: StreamMessage[] = [
          { kind: "section", name: "Abstract", summary: "Decentralized peer review with token staking..." },
          { kind: "section", name: "Methods", summary: "Smart contracts orchestrate assignment, staking, slashing..." },
          { kind: "red_flags", items: [{ issue: "No reproducibility link", page: 1, severity: "high" }] },
          { kind: "done" },
        ];
        setMessages(demo);
        const items: Flag[] = Array.isArray((demo[2] as any).items) ? ((demo[2] as any).items as Flag[]) : [];
        setFlags(items);
        onNewFlags?.(items.length);
      }
    }

    run();
    return () => ctrl.abort();
  }, [open, paperText, onNewFlags]);

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: open ? 0 : 20, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      className="relative z-[60]"
    >
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg grid place-items-center bg-gradient-to-br from-primary/80 to-secondary/80">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="font-semibold">Axon Assistant</div>
          </div>
          <button
            className="rounded-md p-2 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary/60"
            onClick={onClose}
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3 max-h-[calc(100vh-240px)] overflow-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-3 bg-background/40">
              {m.kind === "section" && (
                <>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{m.name}</div>
                  <div className="text-sm mt-1">{m.summary}</div>
                </>
              )}

              {m.kind === "status" && (
                <div className="text-xs text-muted-foreground">{m.msg}</div>
              )}

              {m.kind === "red_flags" && Array.isArray(m.items) && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Red Flags</div>
                  {m.items.map((f, j) => (
                    <div
                      key={j}
                      className="text-sm inline-flex items-center gap-2 rounded-md px-2 py-1 bg-red-500/10 border border-red-500/20"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>{f.issue}</span>
                      {f.page ? <span className="opacity-60">• Page {f.page}</span> : null}
                      {f.severity ? <span className="opacity-60">• {f.severity}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
