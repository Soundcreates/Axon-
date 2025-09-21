import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingAssistantButton({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      className="fab"
      onClick={onOpen}
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      title="Open Axon Assistant"
    >
      <Bot size={18} />
    </motion.button>
  );
}
