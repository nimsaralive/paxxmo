export const revealInView = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
};

export const revealTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const cardHover = {
  y: -4,
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export const tapScale = {
  scale: 0.97,
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};
