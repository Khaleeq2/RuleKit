import type { Metadata } from 'next';

const FALLBACK_BASE_URL = 'https://rulekit.io';

export const publicMetadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_BASE_URL
);

export function buildPublicMetadata(options: {
  title: string;
  description: string;
  canonicalPath: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: options.canonicalPath,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url: options.canonicalPath,
      siteName: 'RuleKit',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
    },
  };
}
