"use client";
import { useEffect, useState } from "react";
import { MessageCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingAssistantButton({
  onOpen,
  alerts = 0,
}: { onOpen: () => void; alerts?: number }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (alerts > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 800);
      return () => clearTimeout(t);
    }
  }, [alerts]);

  return (
    <motion.button
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-[70] rounded-2xl px-4 py-3 shadow-glow text-sm font-medium
                 bg-gradient-to-br from-primary/90 to-secondary/90 text-white border border-white/10 focusable"
      whileTap={{ scale: 0.98 }}
      aria-label="Open Axon Assistant"
    >
      <span className="inline-flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        Axon Assistant
        {alerts > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-white/15">
            <AlertTriangle className="w-3 h-3" />
            {alerts}
          </span>
        )}
      </span>
      {pulse && <span className="absolute inset-0 rounded-2xl ring-4 ring-secondary/25 animate-ping" />}
    </motion.button>
  );
}
