import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Timer, Coins, FileText } from "lucide-react";
import { Link } from "react-router-dom";

type Manuscript = {
  id: string; title: string; author: string; field: string;
  cid: string; bounty: number; deadlineDays: number; reputationReq: number; status: "Pending"|"InReview"|"Decision";
};

const SAMPLE: Manuscript[] = [
  { id: "MSK-2025-001", title: "Sparse Attention Improves Ocean Eddy Forecasting", author: "0x8A3…91C2", field: "ML / Oceanography", cid: "bafybeigdyrci123", bounty: 420, deadlineDays: 10, reputationReq: 60, status: "Pending" },
  { id: "MSK-2025-002", title: "Catalyst-Free Room Temperature Ammonia Synthesis", author: "0x2c1…aa77", field: "Chemistry", cid: "bafybeigdyrci456", bounty: 300, deadlineDays: 7, reputationReq: 45, status: "Pending" },
  { id: "MSK-2025-003", title: "Axon: Token-Aligned Transparent Peer Review", author: "0xA11…0N00", field: "DeSci / Systems", cid: "bafybeigdyrci789", bounty: 500, deadlineDays: 5, reputationReq: 50, status: "InReview" },
];

export default function Explore() {
  const [manuscripts, setManuscripts] = useState(SAMPLE);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return manuscripts;
    return manuscripts.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.field.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.cid.toLowerCase().includes(q)
    );
  }, [query, manuscripts]);

  const stakeForReview = async (m: Manuscript) => {
    // mock chain call
    await new Promise(r => setTimeout(r, 500));
    alert(`Stake locked for ${m.id}`);
  };

  return (
    <main className="page narrow">
      <div className="section-head">
        <h2>Live Opportunities</h2>
        <div className="search">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title / field / CID / id" />
        </div>
      </div>

      <motion.div layout className="grid">
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i*0.03 }}>
            <div className="card">
              <div className="card-head">
                <div className="title">{m.title}</div>
                <div className="badge">{m.field}</div>
              </div>
              <div className="muted">
                <span>Author {m.author}</span> · <span>ID {m.id}</span>
              </div>
              <div className="row">
                <div className="muted"><Timer size={16}/> {m.deadlineDays} days</div>
                <div className="muted"><Coins size={16}/> {m.bounty} AXN</div>
                <div className="muted">Req. Rep ≥ {m.reputationReq}</div>
              </div>
              <div className="row">
                <a className="pill" href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={14}/> IPFS
                </a>
                <Link className="pill" to={`/review/${encodeURIComponent(m.id)}`}>
                  <FileText size={14}/> Review
                </Link>
                <button className="pill primary" onClick={() => stakeForReview(m)}>Accept & Stake</button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
