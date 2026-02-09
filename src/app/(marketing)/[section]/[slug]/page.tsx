import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicPageTemplate } from '../../_components/PublicPageTemplate';
import {
  PUBLIC_SECTIONS,
  getSectionDetail,
  getSectionSlugs,
  isSectionKey,
} from '../../_lib/public-content';
import { buildPublicMetadata } from '../../_lib/public-metadata';

interface SectionDetailPageProps {
  params: Promise<{
    section: string;
    slug: string;
  }>;
}

export function generateStaticParams() {
  return PUBLIC_SECTIONS.flatMap((section) =>
    getSectionSlugs(section).map((slug) => ({ section, slug }))
  );
}

export async function generateMetadata({
  params,
}: SectionDetailPageProps): Promise<Metadata> {
  const { section, slug } = await params;

  if (!isSectionKey(section)) {
    return {};
  }

  const data = getSectionDetail(section, slug);
  if (!data) {
    return {};
  }

  return buildPublicMetadata({
    title: data.title,
    description: data.description,
    canonicalPath: `/${section}/${slug}`,
  });
}

export default async function SectionDetailPage({
  params,
}: SectionDetailPageProps) {
  const { section, slug } = await params;

  if (!isSectionKey(section)) {
    notFound();
  }

  const data = getSectionDetail(section, slug);
  if (!data) {
    notFound();
  }

  return (
    <PublicPageTemplate
      eyebrow={data.eyebrow}
      title={data.title}
      description={data.description}
      bullets={data.bullets}
      sections={data.sections}
      primaryCta={data.primaryCta}
      secondaryCta={data.secondaryCta}
    />
  );
}
