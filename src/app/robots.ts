import type { MetadataRoute } from 'next';

const FALLBACK_SITE_URL = 'https://rulekit.io';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return {
    rules: maintenanceMode
      ? [{ userAgent: '*', disallow: '/' }]
      : [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
