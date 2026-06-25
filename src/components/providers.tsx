'use client';

import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {/* Honor the OS "reduce motion" setting across every framer-motion animation. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
