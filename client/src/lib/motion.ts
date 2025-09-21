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
