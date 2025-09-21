import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background animate-pulse -z-10" />

      {/* Hero */}
      <div className="max-w-5xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Logo className="mx-auto h-24 w-24" />
          <h1 className="mt-6 text-5xl font-extrabold">
            Transparent, Incentivized <span className="text-secondary">Peer Review</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Stake to review. Earn rewards. Immutable history — all on-chain.
          </p>
        </motion.div>
      </div>

      {/* Mini previews of sections */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 pb-20">
        {[
          { title: "Explore Calls", desc: "Browse open manuscripts ready for review.", link: "/explore" },
          { title: "Submit Manuscript", desc: "Upload PDF to IPFS & confirm on-chain.", link: "/submit" },
          { title: "My Reviews", desc: "Track your stakes, deadlines, and feedback.", link: "/reviews" },
          { title: "Profile", desc: "Build your reputation and expertise profile.", link: "/profile" },
        ].map((sec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="bg-card/80 border border-border rounded-2xl p-6 shadow-glow hover:scale-[1.02] transition"
          >
            <h3 className="text-xl font-bold mb-2">{sec.title}</h3>
            <p className="text-muted-foreground mb-4">{sec.desc}</p>
            <Link to={sec.link} className="px-4 py-2 bg-primary text-white rounded-xl">
              Go →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
