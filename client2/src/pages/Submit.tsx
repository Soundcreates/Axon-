import { useRef, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { FileUp, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function Submit() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [anon, setAnon] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    if (!title || !file) return;
    setSubmitting(true);
    setDone(false);
    await new Promise((r) => setTimeout(r, 1000)); // simulate upload/tx
    setSubmitting(false);
    setDone(true);
    if (fileRef.current) fileRef.current.value = "";
    setFile(null);
    setTitle("");
  };

  return (
    <main className="max-w-3xl mx-auto px-5 pt-28 pb-10">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black mb-5">
        Submit a Manuscript
      </motion.h1>
      <GlassCard>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-white/60">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter manuscript title"
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:border-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">PDF File</label>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/90 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white/80"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAnon((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/90 hover:bg-white/5 text-sm"
            >
              {anon ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {anon ? "Anonymized" : "Public"}
            </button>
            <span className="text-xs text-white/60">Control author visibility during review.</span>
          </div>
          <button
            disabled={!title || !file || submitting}
            onClick={onSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 text-black font-semibold disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {submitting ? "Submitting…" : "Submit to IPFS & Chain"}
          </button>

          {done && (
            <div className="inline-flex items-center gap-2 text-emerald-300 text-sm">
              <Check className="h-4 w-4" /> Submitted ✓
            </div>
          )}
        </div>
      </GlassCard>
    </main>
  );
}
