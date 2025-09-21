import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, FileUp, CheckCheck, AlertCircle } from "lucide-react";

export default function Submit() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [anon, setAnon] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadToIPFS = async (f: File, onP: (v:number)=>void): Promise<string> => {
    return new Promise(res => {
      let p=0;
      const iv = setInterval(()=>{
        p += Math.random()*18;
        if (p >= 100){ clearInterval(iv); onP(100); setTimeout(()=>res("bafy_"+Math.random().toString(36).slice(2,8)), 300); }
        else onP(Math.min(99, Math.floor(p)));
      }, 120);
    });
  };

  const submit = async () => {
    if (!file || !title) return;
    setSubmitting(true);
    setProgress(0);
    try {
      const cid = await uploadToIPFS(file, setProgress);
      await new Promise(r=>setTimeout(r, 600)); // mock on-chain anchor
      alert(`Submitted: ${title}\nIPFS: ${cid}\nAnon: ${anon ? "yes":"no"}`);
      setTitle(""); setFile(null); inputRef.current && (inputRef.current.value="");
    } catch {
      alert("Submit failed");
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <main className="page narrow">
      <h2>Submit a Manuscript</h2>
      <div className="card">
        <div className="form-row">
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Enter manuscript title" />
        </div>
        <div className="form-row">
          <label>PDF File</label>
          <input ref={inputRef} type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="row">
          <button className="pill" onClick={()=>setAnon(v=>!v)}>
            {anon ? <EyeOff size={14}/> : <Eye size={14}/>} {anon ? "Anonymized" : "Public"}
          </button>
          <span className="muted">Control author visibility during review.</span>
        </div>
        <button className="pill primary" disabled={!title || !file || submitting} onClick={submit}>
          <FileUp size={14}/> {submitting ? "Submitting…" : "Submit to IPFS & Chain"}
        </button>
        {submitting && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="progress">
            <div className="bar" style={{ width: `${progress}%` }} />
            <div className="progress-row">
              <span className="muted"><AlertCircle size={14}/> Uploading…</span>
              <span className="muted"><CheckCheck size={14}/> {progress}%</span>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
