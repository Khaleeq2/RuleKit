import { notFound, redirect } from 'next/navigation';
import {
  PUBLIC_SECTIONS,
  isSectionKey,
} from '../_lib/public-content';

interface SectionIndexPageProps {
  params: Promise<{
    section: string;
  }>;
}

export function generateStaticParams() {
  return PUBLIC_SECTIONS.map((section) => ({ section }));
}

const SECTION_REDIRECTS: Record<string, string> = {
  product: '/product/overview',
  pricing: '/pricing/plans',
  developers: '/developers/quickstart',
  resources: '/resources/docs',
  company: '/company/about',
  legal: '/legal/terms',
  solutions: '/solutions',
};

export default async function SectionIndexPage({
  params,
}: SectionIndexPageProps) {
  const { section } = await params;

  if (!isSectionKey(section)) {
    notFound();
  }

  const target = SECTION_REDIRECTS[section];
  if (target) {
    redirect(target);
  }

  notFound();
}
