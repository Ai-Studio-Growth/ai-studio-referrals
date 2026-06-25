import Link from 'next/link';
import { Logo } from '@/components/logo';

/** Standalone chrome for the referee invite page — no app sidebar, just brand. */
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <header className="flex h-16 items-center justify-center border-b border-border/50">
        <Link href="/" aria-label="Ai Studio Referrals home">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4">{children}</main>
    </div>
  );
}
