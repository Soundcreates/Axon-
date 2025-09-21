// client/src/lib/motion.ts
import { Variants, Transition } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const fadeUp: Variants = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const hoverLift = {
  whileHover: { y: -2, scale: 1.01 },
  transition: { duration: 0.18, ease: easeOutExpo },
};
