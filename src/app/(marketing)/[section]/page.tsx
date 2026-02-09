import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicPageTemplate } from '../_components/PublicPageTemplate';
import {
  PUBLIC_SECTIONS,
  getSectionIndex,
  isSectionKey,
} from '../_lib/public-content';
import { buildPublicMetadata } from '../_lib/public-metadata';

interface SectionIndexPageProps {
  params: Promise<{
    section: string;
  }>;
}

export function generateStaticParams() {
  return PUBLIC_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: SectionIndexPageProps): Promise<Metadata> {
  const { section } = await params;

  if (!isSectionKey(section)) {
    return {};
  }

  const data = getSectionIndex(section);
  return buildPublicMetadata({
    title: data.title,
    description: data.description,
    canonicalPath: `/${section}`,
  });
}

export default async function SectionIndexPage({
  params,
}: SectionIndexPageProps) {
  const { section } = await params;

  if (!isSectionKey(section)) {
    notFound();
  }

  const data = getSectionIndex(section);

  return (
    <PublicPageTemplate
      eyebrow={data.eyebrow}
      title={data.title}
      description={data.description}
      bullets={data.bullets}
      primaryCta={data.primaryCta}
      secondaryCta={data.secondaryCta}
    />
  );
}
