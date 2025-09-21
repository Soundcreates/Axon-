<<<<<<< HEAD
import { cubicBezier, type Variants } from "framer-motion";

export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
export const easeOutQuint = cubicBezier(0.22, 1, 0.36, 1);

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutExpo } },
};

export const stagger: Variants = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const hoverLift = {
  whileHover: { y: -3, scale: 1.01, transition: { duration: 0.22, ease: easeOutQuint } },
} as const;
=======
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
>>>>>>> dd47788 (Client 3 added)
