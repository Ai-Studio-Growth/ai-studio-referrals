'use client';

import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  animate,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/*
 * Motion kit for the agency microsite. Every animation is gated behind
 * `prefers-reduced-motion` (framer-motion runs in JS, so the global CSS
 * reduced-motion rule in globals.css does not stop it — we honor it here).
 * Visuals lean entirely on design tokens so light/dark theming keeps working.
 */

const ease = [0.16, 1, 0.3, 1] as const;

/** Scroll-reveal wrapper — fades + lifts content into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its <StaggerItem> children as the group enters view. */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Count-up number that animates the first time it scrolls into view. */
export function Counter({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.6,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Seamless infinite logo/word marquee. Static (no scroll) under reduced motion. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const row = [...items, ...items];
  return (
    <div className={className}>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <motion.div
          className="flex w-max items-center gap-12 py-1"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={reduce ? undefined : { duration: 26, repeat: Infinity, ease: 'linear' }}
        >
          {row.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="whitespace-nowrap text-lg font-semibold tracking-tight text-muted/80"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/** Pointer-reactive 3D tilt wrapper for cards. Disabled under reduced motion / touch. */
export function Tilt({
  children,
  className,
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * intensity);
    rx.set(-py * intensity);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  );
}

/** Animated aurora backdrop — drifting brand/accent blobs over a faint grid. */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  const drift = (i: number) =>
    reduce
      ? undefined
      : {
          x: [0, i % 2 ? 40 : -40, 0],
          y: [0, i % 2 ? -30 : 30, 0],
          scale: [1, 1.12, 1],
        };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <motion.div
        className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand/30 blur-[120px]"
        animate={drift(0)}
        transition={reduce ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-6rem] top-10 h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-[110px]"
        animate={drift(1)}
        transition={reduce ? undefined : { duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-brand/20 blur-[120px]"
        animate={drift(2)}
        transition={reduce ? undefined : { duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** Slow-rotating ring + orbiting dots — the hero's animated centerpiece. */
export function OrbitField({ labels }: { labels: string[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border border-border/70"
          style={{ inset: `${ring * 14}%` }}
          animate={reduce ? undefined : { rotate: ring % 2 ? -360 : 360 }}
          transition={reduce ? undefined : { duration: 30 + ring * 12, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-glow" />
          {ring === 1 && (
            <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent" />
          )}
        </motion.div>
      ))}

      {/* Glowing core */}
      <motion.div
        className="absolute inset-[34%] grid place-items-center rounded-full bg-brand-gradient text-center text-brand-fg shadow-glow"
        animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
        transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="px-2 text-sm font-bold leading-tight">Your brand, amplified</span>
      </motion.div>

      {/* Orbiting capability chips */}
      {labels.map((label, i) => {
        const angle = (i / labels.length) * Math.PI * 2;
        const radius = 46; // % of container
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <motion.div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={reduce ? undefined : { duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="chip whitespace-nowrap border-border bg-surface/90 shadow-soft backdrop-blur">
              {label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Thin scroll-progress bar fixed to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand-gradient"
      style={{ scaleX }}
    />
  );
}

/** Parallax wrapper — translates its child as the page scrolls past it. */
export function Parallax({ children, amount = 60, className }: { children: ReactNode; amount?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}
