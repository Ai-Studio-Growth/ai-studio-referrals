'use client';

import { useRef, useState } from 'react';

const LEN = 6;

/**
 * Six-box one-time-code input. Mirrors its combined value into a hidden
 * <input name="code"> so it submits with the surrounding form. Supports paste,
 * auto-advance, and backspace-to-previous.
 */
export function OtpInput({ name = 'code', autoFocus = true }: { name?: string; autoFocus?: boolean }) {
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function set(i: number, v: string) {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
  }

  function onChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, '');
    if (!v) {
      set(i, '');
      return;
    }
    // If multiple chars arrive (autofill), distribute across the boxes.
    if (v.length > 1) {
      const next = [...digits];
      for (let k = 0; k < v.length && i + k < LEN; k++) next[i + k] = v[k];
      setDigits(next);
      const last = Math.min(i + v.length, LEN - 1);
      refs.current[last]?.focus();
      return;
    }
    set(i, v);
    if (i < LEN - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < LEN - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(LEN).fill('');
    for (let k = 0; k < text.length; k++) next[k] = text[k];
    setDigits(next);
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <input type="hidden" name={name} value={digits.join('')} />
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? LEN : 1}
          value={d}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-full rounded-xl border bg-surface-2/60 text-center text-lg font-semibold outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/30 sm:h-14"
        />
      ))}
    </div>
  );
}
