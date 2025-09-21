// client2/src/components/Logo.tsx
import { motion } from "framer-motion";

type LogoProps = {
  size?: number;          // pixel size for icon circle
  pulse?: boolean;        // subtle breathing animation
  className?: string;
};

export default function Logo({ size = 22, pulse = false, className }: LogoProps) {
  return (
    <div className={className}>
      <motion.div
        aria-label="Axon logo"
        initial={{ scale: 1 }}
        animate={pulse ? { scale: [1, 1.04, 1] } : undefined}
        transition={pulse ? { duration: 2.2, repeat: Infinity } : undefined}
        className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm"
        style={{ width: size, height: size }}
      >
        {/* inner neuron dot */}
        <div
          className="rounded-full bg-white/90"
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
        {/* orbit ring */}
        <div
          className="absolute inset-0 rounded-full ring-2 ring-white/50"
          style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)" }}
        />
      </motion.div>
    </div>
  );
}
