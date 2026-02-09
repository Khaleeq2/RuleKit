import type { MetadataRoute } from 'next';
import {
  PUBLIC_SECTIONS,
  getSectionSlugs,
} from './(marketing)/_lib/public-content';

const FALLBACK_SITE_URL = 'https://rulekit.io';

function buildAbsoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
  return `${base}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    '/',
    '/contact',
    '/auth/sign-in',
    '/auth/sign-up',
    '/legal/terms',
    '/legal/privacy',
    '/legal/security',
  ];

  const sectionIndexRoutes = PUBLIC_SECTIONS.map((section) => `/${section}`);
  const sectionDetailRoutes = PUBLIC_SECTIONS.flatMap((section) =>
    getSectionSlugs(section).map((slug) => `/${section}/${slug}`)
  );

  return [...staticRoutes, ...sectionIndexRoutes, ...sectionDetailRoutes].map(
    (path) => ({
      url: buildAbsoluteUrl(path),
      lastModified: now,
      changeFrequency: path.startsWith('/legal/')
        ? 'monthly'
        : path === '/'
          ? 'weekly'
          : 'daily',
      priority: path === '/' ? 1 : path.startsWith('/product') ? 0.8 : 0.7,
    })
  );
}
