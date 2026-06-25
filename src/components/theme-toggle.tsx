'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * Theme toggle. Both icons are always in the DOM; visibility is driven purely by
 * the `dark` class on <html> (set by next-themes) via Tailwind `dark:` variants,
 * so the button never renders empty regardless of hydration timing.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="btn-ghost h-10 w-10 !p-0"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
