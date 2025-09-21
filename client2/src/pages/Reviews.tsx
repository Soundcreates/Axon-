import { motion } from "framer-motion";
import { Coins } from "lucide-react";

export default function Reviews() {
  return (
    <main className="page narrow">
      <h2>My Review Journey</h2>
      <div className="grid two">
        <motion.div initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} className="card">
          <div className="title">Reviewer Reputation</div>
          <div className="big">72</div>
          <div className="progress"><div className="bar" style={{width:"72%"}}/></div>
          <div className="muted">Higher rep unlocks higher bounties and priority matching.</div>
        </motion.div>
        <motion.div initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} className="card">
          <div className="title">Recent Rewards</div>
          <div className="row"><Coins size={16}/> +220 AXN — MSK-2025-003</div>
          <div className="row"><Coins size={16}/> +150 AXN — MSK-2025-001</div>
          <div className="muted">Slashing occurs for late or low-quality reviews.</div>
        </motion.div>
      </div>
    </main>
  );
}
