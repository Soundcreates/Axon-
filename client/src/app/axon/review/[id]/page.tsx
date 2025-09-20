"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { ChevronLeft, FileText, PanelLeft, PanelRight, Sparkles } from "lucide-react";

import PdfViewer from "@/components/PdfViewer";
import WaveBackdrop from "@/components/WaveBackdrop";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const cid = search.get("cid") || "";
  const title = search.get("title") || "Manuscript";

  const [assistantOpen, setAssistantOpen] = useState(true);

  const paperText = useMemo(
    () =>
      `Title: ${title}\nAbstract: (extracted by backend from IPFS ${cid}) ... Methods ... Results ... Conclusion ...`,
    [title, cid]
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <WaveBackdrop />

      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/axon")} aria-label="Back">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl grid place-items-center bg-gradient-to-br from-primary/80 to-secondary/80">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold truncate max-w-[42vw]">{title}</div>
              <div className="text-xs text-muted-foreground">ID: {id} • CID: {cid.slice(0, 12)}…</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">Deadline: 5 days</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssistantOpen((v) => !v)}
              aria-label="Toggle Assistant"
            >
              {assistantOpen ? <PanelLeft className="w-4 h-4 mr-2" /> : <PanelRight className="w-4 h-4 mr-2" />}
              {assistantOpen ? "Hide Assistant" : "Show Assistant"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          <section className={assistantOpen ? "col-span-12 lg:col-span-8" : "col-span-12"}>
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" /> Viewing from IPFS
              <a
                className="underline hover:no-underline"
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noreferrer"
              >
                ipfs.io/ipfs/{cid.slice(0, 20)}…
              </a>
            </div>
            <PdfViewer url={`https://ipfs.io/ipfs/${cid}`} width={assistantOpen ? 840 : 1040} />
          </section>

          {assistantOpen && (
            <aside className="col-span-12 lg:col-span-4 z-[60]">
              <AssistantPanel
                open={true}
                onClose={() => setAssistantOpen(false)}
                paperText={paperText}
              />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
