import type { Metadata } from 'next';
import { buildPublicMetadata } from './_lib/public-metadata';
import { HeroSectionV2 } from './_components/landing/HeroSectionV2';
import { MicroSocialProofSection } from './_components/landing/MicroSocialProofSection';
import { HowItWorksV2Section } from './_components/landing/HowItWorksV2Section';
import { CoreBenefitsSection } from './_components/landing/CoreBenefitsSection';
import { ProductUISection } from './_components/landing/ProductUISection';
import { ObjectionHandlingSection } from './_components/landing/ObjectionHandlingSection';
import { FinalCTASection } from './_components/landing/FinalCTASection';

export const metadata: Metadata = buildPublicMetadata({
  title: 'RuleKit — Turn human judgment into rules that run themselves',
  description:
    'Write rules in plain English. Run them on any input. Get instant, explainable verdicts — without hardcoding business logic.',
  canonicalPath: '/',
});

function JsonLd() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RuleKit',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rulekit.io',
    description:
      'Write rules in plain English. Run them on any input. Get instant, explainable verdicts — without hardcoding business logic.',
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RuleKit',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rulekit.io',
    description:
      'Judgment infrastructure for every team. Define, test, deploy, and audit rule logic.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
    </>
  );
}

export default function MarketingHomePage() {
  return (
    <>
      <JsonLd />
      <HeroSectionV2 />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-3xl bg-[#f0f3f8] px-8 py-16 sm:px-12 sm:py-20">
            <MicroSocialProofSection />
            <div className="mt-16 border-t border-slate-200/60 pt-16">
              <CoreBenefitsSection />
            </div>
          </div>
        </div>
      </section>

      <HowItWorksV2Section />
      <ProductUISection />
      <ObjectionHandlingSection />
      <FinalCTASection />
    </>
  );
}
