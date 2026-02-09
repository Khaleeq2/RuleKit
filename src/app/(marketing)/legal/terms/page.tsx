import type { Metadata } from 'next';
import { buildPublicMetadata } from '../../_lib/public-metadata';

export const metadata: Metadata = buildPublicMetadata({
  title: 'Terms of Service',
  description: 'Terms of Service for using RuleKit — the rules engine for teams that need testable, explainable decisions.',
  canonicalPath: '/legal/terms',
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
      <header className="mb-12">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--brand)]">Legal</p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-3 text-[14px] text-slate-400">Effective date: February 9, 2026</p>
      </header>

      <div className="prose-legal space-y-8 text-[15px] leading-[1.75] text-slate-600 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using RuleKit (&ldquo;the Service&rdquo;), operated by RuleKit (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
          <p>
            We may update these terms from time to time. We will notify you of material changes by posting the revised terms on the Service with an updated effective date. Your continued use after such changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            RuleKit is a web-based platform that enables users to define business rules in plain language, evaluate content against those rules, and receive structured, explainable verdicts. The Service includes the web application, API endpoints, email notifications, and any related documentation.
          </p>
        </section>

        <section>
          <h2>3. Account Registration</h2>
          <p>
            To use the Service, you must create an account with a valid email address and password. You are responsible for:
          </p>
          <ul>
            <li>Providing accurate and complete registration information.</li>
            <li>Maintaining the security of your account credentials.</li>
            <li>All activity that occurs under your account.</li>
          </ul>
          <p>
            You must notify us immediately at <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a> if you suspect unauthorized access to your account.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Upload or process content that infringes on third-party intellectual property rights.</li>
            <li>Attempt to gain unauthorized access to the Service, other accounts, or systems connected to the Service.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Use the Service to build a competing product or to reverse-engineer any aspect of the Service.</li>
            <li>Exceed reasonable usage limits or abuse API endpoints in a manner that degrades the Service for others.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, with or without notice depending on the severity of the violation.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of all rules, content, and data you upload to RuleKit (&ldquo;Your Content&rdquo;). By using the Service, you grant us a limited license to process Your Content solely for the purpose of providing the Service to you.
          </p>
          <h3>Our Service</h3>
          <p>
            The Service, including its design, features, documentation, and underlying technology, is owned by RuleKit and protected by intellectual property laws. Nothing in these terms grants you rights to our trademarks, logos, or branding.
          </p>
        </section>

        <section>
          <h2>6. Service Availability and Support</h2>
          <p>
            We strive to keep the Service available and performant, but we do not guarantee uninterrupted or error-free operation. We may perform scheduled maintenance or make changes that temporarily affect availability.
          </p>
          <p>
            Support is provided on a reasonable-efforts basis via <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>.
          </p>
        </section>

        <section>
          <h2>7. Billing and Credits</h2>
          <p>
            Certain features of the Service may require payment or credit consumption. You agree to pay all fees associated with your account. All fees are non-refundable unless otherwise stated. We reserve the right to change pricing with 30 days&apos; notice.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, RuleKit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising out of or related to your use of the Service.
          </p>
          <p>
            Our total liability for any claim arising from these terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
          </p>
        </section>

        <section>
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            RuleKit does not warrant that verdicts or evaluations produced by the Service are legally sufficient, complete, or suitable for any specific regulatory or compliance purpose. You are responsible for independently verifying the accuracy and applicability of any output.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            You may close your account at any time by contacting us. We may suspend or terminate your access if you violate these terms.
          </p>
          <p>
            Upon termination, your right to use the Service ceases immediately. We may retain Your Content for a reasonable period to comply with legal obligations, after which it will be deleted.
          </p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United States. Any disputes arising from these terms or the Service will be resolved through binding arbitration or in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
            <a href="mailto:team@rulekit.io" className="text-[var(--brand)] hover:underline">team@rulekit.io</a>.
          </p>
        </section>

      </div>
    </article>
  );
}
