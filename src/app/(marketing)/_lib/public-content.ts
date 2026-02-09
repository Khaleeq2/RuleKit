import type { ContentSection } from '../_components/PublicPageTemplate';

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
  sections?: ContentSection[];
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
      sections: [
        { heading: 'Step 1 — Define your decision', body: 'Start by creating a decision and defining its schema: the fields your rules will operate on. Add rules in plain English — each rule describes a condition, a pass/fail outcome, and a reason. No code, no configuration files.' },
        { heading: 'Step 2 — Test before you ship', body: 'Add test cases with sample inputs and expected outcomes. Run individual tests or full suites against the Groq-powered evaluation engine. See exactly which rules fired, which passed, and why — before anything goes live.' },
        { heading: 'Step 3 — Version and deploy', body: 'Snapshot your rules as a version. Promote versions across environments (draft → staging → production). Each version preserves the exact rule set, so you can roll back instantly if behavior changes unexpectedly.' },
        { heading: 'Step 4 — Monitor and iterate', body: 'Every evaluation is logged with full trace data: verdict, per-rule results, confidence scores, and latency. Use the history view to spot trends, debug failures, and continuously improve your decision logic.' },
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
      sections: [
        { heading: 'Schema-first design', body: 'Every decision starts with a schema — the structured fields your rules inspect. Schemas enforce consistency across rule conditions and test inputs. When the schema changes, you see immediately which rules and tests need updating.' },
        { heading: 'Plain-English rules', body: 'Rules are written as natural language conditions with explicit pass/fail verdicts and reason strings. No DSLs, no regex, no code. The AI evaluation engine interprets your rules against input data and returns structured, explainable results.' },
        { heading: 'Integrated test management', body: 'Test cases live alongside rules in the same workspace. Each test specifies an input payload and an expected verdict. Run tests individually or as a suite to validate behavior before promoting a version.' },
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
      sections: [
        { heading: 'Structured verdicts, not just answers', body: 'Each evaluation returns a top-level pass/fail verdict plus per-rule breakdowns with confidence scores, evidence spans, and detailed reasons. You see exactly why a decision was made — not just what the answer is.' },
        { heading: 'Iterate in the same session', body: 'After an evaluation, continue the conversation. Ask follow-up questions, modify the input, or request clarification — all within the same session thread. The AI stays grounded in the latest evaluation context, so responses are relevant and accurate.' },
        { heading: 'Session history and replay', body: 'Every session is saved with its full message history, evaluation results, and verdict. Return to any session from the history page to review past interactions or re-run evaluations with updated rules.' },
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
      sections: [
        { heading: 'Test-driven decision logic', body: 'Define test cases with structured input payloads and expected verdicts. When you run a test, it calls the real evaluation engine — not a mock — and compares the actual verdict against your expectation. Failed tests surface immediately.' },
        { heading: 'Immutable version snapshots', body: 'Each version captures the complete state of your schema and rules at a point in time. Versions are immutable — once created, they cannot be modified. This guarantees that production behavior is exactly what was tested.' },
        { heading: 'Environment promotion', body: 'Promote versions across environments: draft for development, staging for validation, production for live traffic. Each promotion is logged in the activity feed so you have a clear audit trail of what changed and when.' },
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
      sections: [
        { heading: 'Simple REST evaluation', body: 'Send a POST request with your input data, decision ID, and rules. The API returns a structured JSON response with the overall verdict, per-rule evaluations, confidence scores, and latency metrics. No SDKs required — any HTTP client works.' },
        { heading: 'Structured response contracts', body: 'Every evaluation response follows a consistent schema: top-level verdict, array of rule evaluations (each with rule_id, verdict, confidence, reason, evidence_spans), and model metadata. Build reliable integrations against a stable contract.' },
        { heading: 'Rate limiting and authentication', body: 'All API routes require a valid Supabase session. Rate limiting prevents abuse. Error responses follow consistent shapes with typed error categories (config, transient, validation) for proper client-side handling.' },
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
      sections: [
        { heading: 'Explainable decisions', body: 'Every evaluation produces a full trace: which rules fired, what evidence was found (or not found), confidence levels, and structured reasons. When a decision is questioned, you can point to exactly why it was made.' },
        { heading: 'Change management', body: 'Version promotion creates an intentional gate between authoring and production. Activity logs track who changed what and when. Combined with immutable version snapshots, you have a complete audit trail.' },
        { heading: 'Data handling', body: 'RuleKit processes input data through Supabase (row-level security enabled) and Groq for AI evaluation. Evaluation inputs are not stored beyond the session. Review our privacy policy and security documentation for detailed data handling practices.' },
      ],
      primaryCta: { label: 'Security Policy', href: '/legal/security' },
      secondaryCta: { label: 'Privacy Policy', href: '/legal/privacy' },
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
      sections: [
        { heading: 'Structured eligibility criteria', body: 'Define rules like "Credit score must be above 650" and "Debt-to-income ratio must not exceed 43%." Each rule produces a clear pass/fail with a reason string — no ambiguity in why an applicant was approved or denied.' },
        { heading: 'Regression-tested updates', body: 'When regulations change or thresholds shift, update your rules and run the full test suite before going live. Tests verify that existing edge cases still produce correct outcomes, catching unintended consequences before they reach applicants.' },
        { heading: 'Audit-ready history', body: 'Every evaluation is logged with the complete rule trace: which rules passed, which failed, what evidence was found. When regulators or compliance teams ask why a decision was made, you have the answer — structured, timestamped, and explainable.' },
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
      sections: [
        { heading: 'Deterministic risk rules', body: 'Express fraud signals as explicit rules: "Transaction amount exceeds $10,000 from a new account created within 24 hours" or "Shipping address differs from billing address in a high-risk region." Each rule fires independently with its own verdict and confidence.' },
        { heading: 'Safe rule evolution', body: 'Fraud patterns evolve — your rules need to evolve with them. Version your rule sets, test changes against known fraud cases and legitimate transactions, and promote only when the test suite passes. No more shipping untested risk logic.' },
        { heading: 'Incident investigation', body: 'When a flagged transaction is disputed, pull up the run history. See exactly which rules fired, what evidence was matched, and the confidence level. Resolve disputes faster with structured explanations instead of opaque risk scores.' },
      ],
      primaryCta: { label: 'Open Decisions', href: '/decisions' },
      secondaryCta: { label: 'Developer Hub', href: '/developers/quickstart' },
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
      sections: [
        { heading: 'Context-aware routing', body: 'Define schemas that capture the routing context: customer tier, issue category, urgency level, language preference. Rules evaluate these fields to determine the right team, queue, or escalation path — consistently and explainably.' },
        { heading: 'Policy as editable rules', body: 'Routing policies often live in tribal knowledge or buried configuration. With RuleKit, policies are explicit rules: "Enterprise customers with billing issues go to the dedicated account team." Anyone can read, test, and update them.' },
        { heading: 'Continuous improvement', body: 'Review routing history to identify patterns: Are certain issue types frequently misrouted? Are response times uneven across tiers? Use the data to refine rules, add new routing conditions, and measure the impact of changes.' },
      ],
      primaryCta: { label: 'Create Decision', href: '/decisions/new' },
      secondaryCta: { label: 'How It Works', href: '/product/how-it-works' },
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
      sections: [
        { heading: 'Policy-driven moderation', body: 'Turn your content policy into structured rules: "Content containing hate speech targeting protected groups must be rejected" or "Posts with external links from accounts less than 7 days old require review." Each rule produces a clear, explainable outcome.' },
        { heading: 'Testable before deployment', body: 'Build test cases from real moderation examples — both content that should pass and content that should be flagged. Run the suite after every rule change to ensure policy updates don\'t accidentally suppress legitimate content or miss violations.' },
        { heading: 'Transparent enforcement', body: 'When users appeal a moderation decision, the full evaluation trace shows exactly which rules fired and why. This transparency builds trust with your community and reduces the burden on human reviewers handling appeals.' },
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
      sections: [
        { heading: 'How credits work', body: 'Each evaluation against your rules consumes one credit. Credits are deducted after a successful evaluation completes. Failed evaluations (e.g., network errors) do not consume credits. Your balance is visible in the Billing dashboard at all times.' },
        { heading: 'Monthly allowance', body: 'Every plan includes a monthly credit allowance that resets on your billing cycle. Free-tier users receive a starter allowance to explore the platform. Pro and Enterprise plans include higher allowances scaled to team usage patterns.' },
        { heading: 'Top-up packs', body: 'When you need more credits beyond your monthly allowance, purchase top-up packs. Purchased credits never expire and stack on top of your monthly allowance. Usage is tracked by decision and time window so you can forecast future needs.' },
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
      sections: [
        { heading: 'What counts as an evaluation?', body: 'One evaluation = one call to the decision engine with a set of input data and rules. Whether the verdict is pass or fail, one credit is consumed. Test runs also consume credits, so you can validate behavior with real execution costs accounted for.' },
        { heading: 'Can I try RuleKit for free?', body: 'Yes. Every new account starts with a free credit allowance — enough to create decisions, write rules, run tests, and evaluate inputs. No credit card required. When you need more capacity, upgrade to a paid plan or purchase top-up credits.' },
        { heading: 'How do I track my usage?', body: 'The Billing & Credits page shows your current balance, monthly usage breakdown by decision, daily usage charts, and full transaction history. You can see exactly where credits are being spent and plan accordingly.' },
      ],
      primaryCta: { label: 'Plans', href: '/pricing/plans' },
      secondaryCta: { label: 'Contact', href: '/contact' },
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
      sections: [
        { heading: 'POST /api/evaluate', body: 'The primary evaluation endpoint. Send a JSON body with input (string — the content to evaluate), decision_id, decision_name, and rules (array of objects with id, name, description, reason). Returns a structured response with verdict, per-rule evaluations, confidence scores, evidence spans, and model metadata.' },
        { heading: 'POST /api/chat', body: 'The conversational endpoint for follow-up interactions within evaluation sessions. Send the conversation history and receive AI-generated responses grounded in the evaluation context. Supports streaming responses for real-time UI updates.' },
        { heading: 'POST /api/title', body: 'Generates AI-powered session titles from the first user message and evaluation verdict. Used internally for session management but available for custom integrations that need human-readable session labels.' },
        { heading: 'Authentication', body: 'All API routes require a valid Supabase session cookie. Unauthenticated requests receive a 401 response. Rate limiting is applied per-user to prevent abuse. Error responses include typed error categories: config, transient, validation, or unknown.' },
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
      sections: [
        { heading: 'Loan eligibility example', body: 'Input: applicant profile with credit_score, annual_income, employment_status, and debt_to_income_ratio. Rules check minimum thresholds. Response includes per-rule verdicts with reasons like "Credit score 720 exceeds minimum 650 — pass" or "Debt-to-income ratio 48% exceeds maximum 43% — fail."' },
        { heading: 'Fraud screening example', body: 'Input: transaction details with amount, account_age_days, ip_country, and shipping_address_match. Rules flag high-risk patterns. Response includes evidence spans highlighting the specific data points that triggered each rule, plus confidence scores for nuanced cases.' },
        { heading: 'Handling evaluation responses', body: 'The response object includes result.verdict (pass/fail), result.evaluations (array of per-rule results), result.model_meta (tokens, model, latency), and result.reason (overall summary). Use the evaluations array to build detailed UI displays or audit logs.' },
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
      sections: [
        { heading: 'February 2026 — MVP Launch', body: 'Initial public release. Core features: decision studio with schema/rules/tests, conversational evaluation with Groq-powered AI, version management with environment promotion, session history with full evaluation traces, credit-based billing, and Google OAuth authentication.' },
        { heading: 'Core capabilities', body: 'Real-time evaluation via /api/evaluate with structured JSON responses. Per-rule verdicts with confidence scores and evidence spans. Session persistence with AI-generated titles. File upload support for text-based inputs. Rate limiting and authentication on all API routes.' },
        { heading: 'Coming soon', body: 'Stripe payment integration for credit top-ups. Team workspaces and shared decisions. Webhook notifications for evaluation outcomes. SDK libraries for Python and JavaScript. Custom evaluation models beyond Groq.' },
      ],
      primaryCta: { label: 'Product Overview', href: '/product/overview' },
      secondaryCta: { label: 'Developer Quickstart', href: '/developers/quickstart' },
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
      secondaryCta: { label: 'Developer Hub', href: '/developers/quickstart' },
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
      sections: [
        { heading: 'Getting started with your first decision', body: 'Create a new decision, define its schema fields (the inputs your rules will evaluate), then add rules in plain English. Each rule should describe a clear condition and what happens when it passes or fails. Start simple — you can always add complexity later.' },
        { heading: 'Building effective test suites', body: 'Good test suites cover three categories: happy paths (inputs that should clearly pass), failure cases (inputs that should clearly fail), and edge cases (inputs near decision boundaries). Run the full suite after every rule change to catch regressions before they reach production.' },
        { heading: 'Reviewing and improving decisions', body: 'Use the history page to review past evaluations. Look for patterns: Are certain rules failing more than expected? Are confidence scores consistently low for specific rule types? Use these insights to refine rule language, adjust thresholds, or add new rules.' },
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
      sections: [
        { heading: 'Current status: Operational', body: 'All RuleKit services are currently operational. The evaluation API, authentication system, and data persistence layer are functioning normally. Check this page for updates during planned maintenance windows or unexpected incidents.' },
        { heading: 'Infrastructure', body: 'RuleKit runs on Supabase (PostgreSQL with row-level security) for data persistence and authentication, Groq for AI-powered rule evaluation, and Vercel for application hosting. Each layer has independent monitoring and failover capabilities.' },
        { heading: 'Incident communication', body: 'During service disruptions, updates are posted here and communicated via email to affected users. For urgent issues, contact support through the contact page. Post-incident reports are published for significant outages.' },
      ],
      primaryCta: { label: 'Contact Support', href: '/contact' },
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
      secondaryCta: { label: 'Contact', href: '/contact' },
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
      sections: [
        { heading: 'Clarity', body: 'Every interface element, rule output, and error message should be immediately understandable. If a decision fails, the user should know exactly why — which rule, what evidence, what confidence level. Ambiguity is a bug. We design for comprehension first.' },
        { heading: 'Pragmatism', body: 'We build for real workflows, not theoretical completeness. Features ship when they solve an actual problem. Configuration is minimized. Defaults are sensible. The path from "I have a problem" to "I have a working solution" should be as short as possible.' },
        { heading: 'Rigor', body: 'Decision logic deserves the same discipline as application code: tested before deployment, versioned for rollback, traced for accountability. We build these practices into the product so they happen naturally — not as afterthoughts bolted on later.' },
      ],
      primaryCta: { label: 'Product', href: '/product/overview' },
      secondaryCta: { label: 'Contact', href: '/contact' },
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
      sections: [
        { heading: 'Get in touch', body: 'Use the contact form on our contact page to reach us directly. We read every message and respond within one business day. Whether you have a technical question, feature request, or partnership proposal — we want to hear from you.' },
        { heading: 'Implementation support', body: 'Setting up your first decision? Running into an edge case with rule evaluation? Need help designing a test suite? Reach out and we will help you get unblocked. Our goal is to make sure every team succeeds with RuleKit from day one.' },
      ],
      primaryCta: { label: 'Contact Form', href: '/contact' },
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
