export type SectionKey =
  | 'product'
  | 'solutions'
  | 'pricing'
  | 'developers'
  | 'resources'
  | 'company'
  | 'legal';

export const PUBLIC_SECTIONS: SectionKey[] = [
  'product',
  'solutions',
  'pricing',
  'developers',
  'resources',
  'company',
  'legal',
];

export interface PageCta {
  label: string;
  href: string;
}

export interface PublicPageData {
  eyebrow: string;
  title: string;
  description: string;
  bullets: [string, string, string];
  primaryCta: PageCta;
  secondaryCta: PageCta;
}

export const sectionIndexData: Record<SectionKey, PublicPageData> = {
  product: {
    eyebrow: 'Product',
    title: 'Product Overview',
    description:
      'RuleKit provides a full decision lifecycle: model schema, define rules, test behavior, deploy versions, and review run history.',
    bullets: [
      'Decision studio unifies schema, rules, tests, and API access.',
      'Conversational evaluation supports natural-language and structured checks.',
      'Version and deployment workflows preserve operational safety.',
    ],
    primaryCta: { label: 'Open App', href: '/home' },
    secondaryCta: { label: 'How It Works', href: '/product/how-it-works' },
  },
  solutions: {
    eyebrow: 'Solutions',
    title: 'Solutions',
    description:
      'Apply RuleKit to eligibility, fraud, routing, and moderation decisioning with testable logic and explainable outcomes.',
    bullets: [
      'Loan eligibility decisions with explicit reason outputs.',
      'Fraud screening logic with clear escalation rules.',
      'Support routing and moderation policy workflows.',
    ],
    primaryCta: { label: 'Loan Eligibility', href: '/solutions/loan-eligibility' },
    secondaryCta: { label: 'Fraud Screening', href: '/solutions/fraud-screening' },
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Pricing',
    description:
      'Transparent plans and credit-based execution keep costs predictable from initial rollout through growth.',
    bullets: [
      'Plan structure aligned to team maturity and governance needs.',
      'Credit model tied directly to execution activity.',
      'Billing visibility for usage tracking and forecasting.',
    ],
    primaryCta: { label: 'Plans', href: '/pricing/plans' },
    secondaryCta: { label: 'Credits', href: '/pricing/credits' },
  },
  developers: {
    eyebrow: 'Developers',
    title: 'Developer Hub',
    description:
      'Get from first decision to production integration with practical quickstarts, examples, and API references.',
    bullets: [
      'Quickstart path for shipping first decision endpoint.',
      'Reference patterns for request/response contracts.',
      'Changelog and status context for production reliability.',
    ],
    primaryCta: { label: 'Quickstart', href: '/developers/quickstart' },
    secondaryCta: { label: 'API Reference', href: '/developers/api-reference' },
  },
  resources: {
    eyebrow: 'Resources',
    title: 'Resources',
    description:
      'Documentation, implementation guides, and operational status pages for ongoing usage and governance.',
    bullets: [
      'Architecture and design-system documentation.',
      'Guides for implementation and rollout discipline.',
      'Status and changelog visibility for operators.',
    ],
    primaryCta: { label: 'Docs', href: '/resources/docs' },
    secondaryCta: { label: 'Guides', href: '/resources/guides' },
  },
  company: {
    eyebrow: 'Company',
    title: 'Company',
    description:
      'RuleKit is built for teams who need dependable decision logic workflows with clarity, speed, and accountability.',
    bullets: [
      'Mission focused on reliable decision infrastructure.',
      'Principles grounded in clarity, pragmatism, and rigor.',
      'Direct contact path for product and implementation questions.',
    ],
    primaryCta: { label: 'About', href: '/company/about' },
    secondaryCta: { label: 'Contact', href: '/company/contact' },
  },
  legal: {
    eyebrow: 'Legal',
    title: 'Legal',
    description:
      'Review terms, privacy policy, and security position for operating RuleKit responsibly in production workflows.',
    bullets: [
      'Terms define service boundaries and usage obligations.',
      'Privacy policy clarifies handling and retention posture.',
      'Security statement outlines operational safeguards.',
    ],
    primaryCta: { label: 'Terms', href: '/legal/terms' },
    secondaryCta: { label: 'Privacy', href: '/legal/privacy' },
  },
};

export const sectionDetailData: Record<SectionKey, Record<string, PublicPageData>> = {
  product: {
    overview: sectionIndexData.product,
    'how-it-works': {
      eyebrow: 'Product',
      title: 'How It Works',
      description:
        'RuleKit follows a practical cycle: define decision logic, validate via tests, promote versions, then review run outcomes.',
      bullets: [
        'Define schema and rule outcomes in the decision studio.',
        'Run targeted tests and suites to catch regressions early.',
        'Promote versions by environment and inspect live history.',
      ],
      primaryCta: { label: 'Open Decisions', href: '/decisions' },
      secondaryCta: { label: 'Developer Quickstart', href: '/developers/quickstart' },
    },
    'decision-studio': {
      eyebrow: 'Product',
      title: 'Decision Studio',
      description:
        'A single workspace for schema definition, rules authoring, tests, deployments, and API integration.',
      bullets: [
        'Author structured decision logic with explicit pass/fail reasons.',
        'Manage rules and tests in one cohesive workflow.',
        'Operate with deployment-aware versioning controls.',
      ],
      primaryCta: { label: 'Open Studio', href: '/decisions' },
      secondaryCta: { label: 'Testing and Versioning', href: '/product/testing-and-versioning' },
    },
    'conversational-evaluation': {
      eyebrow: 'Product',
      title: 'Conversational Evaluation',
      description:
        'Evaluate inputs against rules and iterate with grounded follow-up conversations in the same session thread.',
      bullets: [
        'Structured verdicts include per-rule confidence and reason.',
        'Follow-up chat remains grounded in latest evaluation context.',
        'Comparison views surface improvements and regressions clearly.',
      ],
      primaryCta: { label: 'Try It', href: '/home' },
      secondaryCta: { label: 'Examples', href: '/developers/examples' },
    },
    'testing-and-versioning': {
      eyebrow: 'Product',
      title: 'Testing and Versioning',
      description:
        'Capture expected behavior with tests and manage version promotion to maintain confidence in production behavior.',
      bullets: [
        'Test cases encode expected outcomes before release.',
        'Version snapshots preserve schema and rules state.',
        'Promotion controls reduce live-deployment mistakes.',
      ],
      primaryCta: { label: 'Open Tests', href: '/decisions' },
      secondaryCta: { label: 'Runs History', href: '/history' },
    },
    'api-and-integration': {
      eyebrow: 'Product',
      title: 'API and Integration',
      description:
        'Integrate decision execution with stable request/response contracts and environment-aware endpoint behavior.',
      bullets: [
        'Decision API surface with example payload patterns.',
        'Environment header model for draft/live execution.',
        'Traceable outputs support incident and quality workflows.',
      ],
      primaryCta: { label: 'Quickstart', href: '/developers/quickstart' },
      secondaryCta: { label: 'Open API in App', href: '/decisions' },
    },
    'trust-and-security': {
      eyebrow: 'Product',
      title: 'Trust and Security',
      description:
        'Operational controls and audit visibility help teams manage changes safely and explain runtime outcomes.',
      bullets: [
        'Version promotion workflow introduces intentional release gates.',
        'Run and activity history improve accountability and reviewability.',
        'Public legal and status docs support governance planning.',
      ],
      primaryCta: { label: 'Security Policy', href: '/legal/security' },
      secondaryCta: { label: 'Status', href: '/resources/status' },
    },
  },
  solutions: {
    'loan-eligibility': {
      eyebrow: 'Solutions',
      title: 'Loan Eligibility',
      description:
        'Model eligibility thresholds with explicit reasons and test coverage for consistent lending decisions.',
      bullets: [
        'Credit score and income checks as auditable rules.',
        'Clear reason outputs for fail outcomes.',
        'Template-driven onboarding for fast setup.',
      ],
      primaryCta: { label: 'Start Template', href: '/decisions/new?templates=true' },
      secondaryCta: { label: 'Product Overview', href: '/product/overview' },
    },
    'fraud-screening': {
      eyebrow: 'Solutions',
      title: 'Fraud Screening',
      description:
        'Deploy and evolve risk checks for transaction and behavior patterns with controlled change management.',
      bullets: [
        'Rules capture deterministic fail scenarios.',
        'Tests prevent regressions in risk logic updates.',
        'Run history supports incident triage workflows.',
      ],
      primaryCta: { label: 'Open Decisions', href: '/decisions' },
      secondaryCta: { label: 'Developer Hub', href: '/developers' },
    },
    'support-routing': {
      eyebrow: 'Solutions',
      title: 'Support Routing',
      description:
        'Route requests by priority, category, and customer tier with maintainable decision logic and traceability.',
      bullets: [
        'Schema ensures required routing context is present.',
        'Rules keep ownership policy explicit and editable.',
        'History helps tune routing quality over time.',
      ],
      primaryCta: { label: 'Create Decision', href: '/decisions/new' },
      secondaryCta: { label: 'Guides', href: '/resources/guides' },
    },
    'content-moderation': {
      eyebrow: 'Solutions',
      title: 'Content Moderation',
      description:
        'Standardize policy enforcement by turning moderation criteria into testable, explainable decision outcomes.',
      bullets: [
        'Policy checks produce deterministic reason outputs.',
        'Test suites enforce behavior before release.',
        'Run logs provide moderation trace context.',
      ],
      primaryCta: { label: 'Start Decision', href: '/decisions/new' },
      secondaryCta: { label: 'Trust and Security', href: '/product/trust-and-security' },
    },
  },
  pricing: {
    plans: {
      eyebrow: 'Pricing',
      title: 'Plans',
      description:
        'Select the right plan for team stage, workflow complexity, and governance requirements.',
      bullets: [
        'Clear scope boundaries by plan tier.',
        'Predictable path from individual to team adoption.',
        'Enterprise path for advanced governance needs.',
      ],
      primaryCta: { label: 'Open Billing', href: '/billing' },
      secondaryCta: { label: 'Credits Model', href: '/pricing/credits' },
    },
    credits: {
      eyebrow: 'Pricing',
      title: 'Credits',
      description:
        'Execution consumes credits. Estimate before runs, track actuals after runs, and top up based on demand.',
      bullets: [
        'Pre-run estimates for spend planning.',
        'Post-run true-up for accurate accounting.',
        'Usage history by decision and time window.',
      ],
      primaryCta: { label: 'View Billing', href: '/billing' },
      secondaryCta: { label: 'Plans', href: '/pricing/plans' },
    },
    faq: {
      eyebrow: 'Pricing',
      title: 'Pricing FAQ',
      description:
        'Common answers about plan selection, credits consumption, and operational cost planning.',
      bullets: [
        'How credits map to execution activity.',
        'When to switch plans as usage grows.',
        'How to monitor and forecast spending.',
      ],
      primaryCta: { label: 'Plans', href: '/pricing/plans' },
      secondaryCta: { label: 'Contact', href: '/company/contact' },
    },
  },
  developers: {
    quickstart: {
      eyebrow: 'Developers',
      title: 'Quickstart',
      description:
        'From first decision to first API call in a practical sequence with minimal setup friction.',
      bullets: [
        'Create decision and define schema fields.',
        'Author and test rules before release.',
        'Execute through API and inspect run outputs.',
      ],
      primaryCta: { label: 'Open App', href: '/home' },
      secondaryCta: { label: 'API Reference', href: '/developers/api-reference' },
    },
    'api-reference': {
      eyebrow: 'Developers',
      title: 'API Reference',
      description:
        'Endpoint contracts, header requirements, and response patterns for production-grade integration.',
      bullets: [
        'Decision run endpoint usage model.',
        'Environment and auth header expectations.',
        'Error-shape conventions for client handling.',
      ],
      primaryCta: { label: 'In-App API Docs', href: '/decisions' },
      secondaryCta: { label: 'Examples', href: '/developers/examples' },
    },
    examples: {
      eyebrow: 'Developers',
      title: 'Examples',
      description:
        'Implementation examples for common decisioning scenarios and integration patterns.',
      bullets: [
        'Eligibility and fraud payload patterns.',
        'Expected verdict and reason handling flows.',
        'Deployment-aware request examples.',
      ],
      primaryCta: { label: 'Quickstart', href: '/developers/quickstart' },
      secondaryCta: { label: 'Solutions', href: '/solutions' },
    },
    changelog: {
      eyebrow: 'Developers',
      title: 'Changelog',
      description:
        'Track feature and behavior changes that affect integrations, operations, and rollout planning.',
      bullets: [
        'Release updates summarized for implementation impact.',
        'Migration notes for behavior and route updates.',
        'Operational change visibility for teams.',
      ],
      primaryCta: { label: 'Status', href: '/resources/status' },
      secondaryCta: { label: 'Developer Hub', href: '/developers' },
    },
  },
  resources: {
    docs: {
      eyebrow: 'Resources',
      title: 'Documentation',
      description:
        'Core references covering architecture, development workflow, and design-system standards.',
      bullets: [
        'Architecture and data-flow model.',
        'Development conventions and patterns.',
        'Design tokens and UI system guidance.',
      ],
      primaryCta: { label: 'Guides', href: '/resources/guides' },
      secondaryCta: { label: 'Developer Hub', href: '/developers' },
    },
    guides: {
      eyebrow: 'Resources',
      title: 'Guides',
      description:
        'Applied guidance for implementation quality, testing discipline, and operational rollout.',
      bullets: [
        'Decision lifecycle setup for new teams.',
        'Testing and release readiness workflows.',
        'Operational playbooks for run review.',
      ],
      primaryCta: { label: 'Open App', href: '/home' },
      secondaryCta: { label: 'Quickstart', href: '/developers/quickstart' },
    },
    status: {
      eyebrow: 'Resources',
      title: 'Status',
      description:
        'Operational updates for platform services and maintenance windows that affect user workflows.',
      bullets: [
        'Service availability and reliability notes.',
        'Maintenance and incident communication path.',
        'Change tracking for operational awareness.',
      ],
      primaryCta: { label: 'Maintenance Page', href: '/maintenance' },
      secondaryCta: { label: 'Changelog', href: '/developers/changelog' },
    },
  },
  company: {
    about: {
      eyebrow: 'Company',
      title: 'About',
      description:
        'RuleKit focuses on making business decision logic testable, explainable, and easy to evolve safely.',
      bullets: [
        'Product-first engineering focused on real workflows.',
        'Self-serve experience for fast team adoption.',
        'Operational rigor built into lifecycle tooling.',
      ],
      primaryCta: { label: 'Principles', href: '/company/principles' },
      secondaryCta: { label: 'Contact', href: '/company/contact' },
    },
    principles: {
      eyebrow: 'Company',
      title: 'Principles',
      description:
        'Clarity, pragmatism, and rigor shape how RuleKit is built and how teams use it in production.',
      bullets: [
        'Clarity in interface, rules, and outputs.',
        'Pragmatism in implementation and rollout.',
        'Rigor in testing, deployment, and observability.',
      ],
      primaryCta: { label: 'Product', href: '/product/overview' },
      secondaryCta: { label: 'Contact', href: '/company/contact' },
    },
    contact: {
      eyebrow: 'Company',
      title: 'Contact',
      description:
        'Reach out for product feedback, implementation questions, or partnership discussions.',
      bullets: [
        'Implementation and onboarding support questions.',
        'Product roadmap and feature feedback channel.',
        'Business and partnership inquiry path.',
      ],
      primaryCta: { label: 'Open App', href: '/home' },
      secondaryCta: { label: 'Pricing', href: '/pricing/plans' },
    },
  },
  legal: {
    terms: {
      eyebrow: 'Legal',
      title: 'Terms of Service',
      description:
        'Service terms defining usage expectations, obligations, and platform boundaries for RuleKit accounts.',
      bullets: [
        'Account responsibilities and acceptable use.',
        'Service scope and limitation language.',
        'Operational and compliance obligations.',
      ],
      primaryCta: { label: 'Privacy Policy', href: '/legal/privacy' },
      secondaryCta: { label: 'Security', href: '/legal/security' },
    },
    privacy: {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      description:
        'Privacy disclosures describing data handling, retention, and control expectations in RuleKit workflows.',
      bullets: [
        'Information collection and processing summary.',
        'Retention and deletion expectations.',
        'Contact channel for privacy inquiries.',
      ],
      primaryCta: { label: 'Terms', href: '/legal/terms' },
      secondaryCta: { label: 'Security', href: '/legal/security' },
    },
    security: {
      eyebrow: 'Legal',
      title: 'Security',
      description:
        'Security posture and operational safeguards relevant to decision lifecycle workflows and platform usage.',
      bullets: [
        'Deployment controls and environment separation.',
        'Audit visibility through runs and activity history.',
        'Maintenance and incident communication channels.',
      ],
      primaryCta: { label: 'Status', href: '/resources/status' },
      secondaryCta: { label: 'Contact', href: '/company/contact' },
    },
  },
};

export function getSectionSlugs(section: SectionKey): string[] {
  return Object.keys(sectionDetailData[section]);
}

export function isSectionKey(value: string): value is SectionKey {
  return (PUBLIC_SECTIONS as string[]).includes(value);
}

export function getSectionIndex(section: SectionKey): PublicPageData {
  return sectionIndexData[section];
}

export function getSectionDetail(
  section: SectionKey,
  slug: string
): PublicPageData | null {
  return sectionDetailData[section][slug] ?? null;
}
