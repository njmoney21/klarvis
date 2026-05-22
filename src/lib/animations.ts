import type { Variants } from 'framer-motion'

export const ease = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
}

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
}

export const stagger = (delay = 0.12): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
})

export const viewport = { once: true, margin: '-80px' } as const
