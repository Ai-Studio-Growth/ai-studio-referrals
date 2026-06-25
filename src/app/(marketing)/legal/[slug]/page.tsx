import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Render dynamically — Hostinger's managed runtime mis-serves prerendered static pages (503).
export const dynamic = 'force-dynamic';

const PAGES: Record<string, { title: string; intro: string }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'How we collect, use, and protect the personal data you share with Ai Studio Craft.',
  },
  terms: {
    title: 'Terms of Service',
    intro: 'The terms that govern your use of the Ai Studio Craft referral platform.',
  },
  gdpr: {
    title: 'GDPR Policy',
    intro: 'Your rights under the EU General Data Protection Regulation and how we honor them.',
  },
  refund: {
    title: 'Refund Policy',
    intro: 'When and how refunds are issued for paid Ai Studio Craft plans.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  return { title: page ? `${page.title} · Ai Studio Craft` : 'Legal · Ai Studio Craft' };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
      <p className="mt-3 text-muted">{page.intro}</p>
      <div className="glass mt-8 p-6 text-sm leading-relaxed text-muted">
        <p>
          This is a placeholder page. The full {page.title.toLowerCase()} is being finalized and will be
          published here shortly. For questions in the meantime, reach us at{' '}
          <a href="mailto:support@aistudiocraft.in" className="text-brand hover:underline">
            support@aistudiocraft.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}
