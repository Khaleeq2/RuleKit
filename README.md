<div align="center">
  <img src="public/RuleKit-Slate-Blue.svg" alt="RuleKit" width="48" height="48" />
  <h1>RuleKit</h1>
  <p><strong>A self-serve rules engine for building, testing, and deploying decision logic.</strong></p>
  <p>Define rules. Test them. Ship them. Review every run.</p>
</div>

---

## What is RuleKit?

RuleKit is a platform for teams and builders who need to standardize decision-making — loan approvals, fraud checks, support routing, content moderation, or any pass/fail logic — without hard-coding it into application code.

**Core loop:** Define → Test → Deploy → Review

- **Decisions** — Named rulesets with schemas, conditions, and versioned deployments
- **Rules** — Structured conditions evaluated against input data, returning pass/fail outcomes with reasons
- **Runs** — Full audit trail of every execution: input, output, fired rule, latency, and credit cost
- **Environments** — Promote decisions through Dev → Staging → Prod with version control

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [Motion](https://motion.dev/) (Framer Motion) |
| **Backend** | Supabase (Auth, Database, Edge Functions) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Theme** | `next-themes` (system, light, dark) |

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm**, **yarn**, or **pnpm**
- A [Supabase](https://supabase.com/) project (free tier works)

### Setup

```bash
# Clone the repository
git clone https://github.com/Khaleeq2/RuleKit.git
cd RuleKit

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_PROJECT_ID` | Your Supabase project ID |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `NEXT_PUBLIC_API_URL` | API base URL (default: `http://localhost:3000/api`) |

## Project Structure

```
src/
├── app/
│   ├── components/       # Shared UI components (AppLayout, shadcn/ui)
│   ├── home/             # Home — Decide screen
│   ├── decisions/        # Rules management (CRUD, editor, versions)
│   ├── history/          # Global run history and audit log
│   ├── billing/          # Credits, usage, and top-ups
│   ├── settings/         # User and workspace settings
│   ├── lib/              # Data layer (decisions, rules, runs, billing, types)
│   ├── api/              # API routes
│   └── globals.css       # Design system tokens and global styles
├── lib/                  # Shared utilities
└── styles/               # Additional style modules
docs/
├── ARCHITECTURE.md       # System architecture and data flow
├── DESIGN_SYSTEM.md      # Design tokens, typography, color system
└── DEVELOPMENT.md        # Development guide and conventions
```

## How It Works

1. **Create a Decision** — Name it, describe what it checks
2. **Define Your Schema** — Specify the input fields to evaluate
3. **Add Rules** — Structured conditions: if X then pass/fail, with reasons
4. **Test It** — Run sample data and see results instantly
5. **Deploy** — Version and promote across environments
6. **Use the API** — Copy the endpoint, integrate in minutes

## Key Pages

- **Home** — Submit text, documents, or files to be reviewed against your rules
- **Rules** — Create, manage, and version your rule logic with template-driven onboarding
- **History** — Full run audit: result, latency, credits, environment, and version for every execution
- **Billing** — Credit balance, usage analytics, and top-up packs

## Design Philosophy

Every visible surface is intentional. The interface is engineered to feel calm, authoritative, and tool-grade — not decorative.

- **Clarity over complexity** — No feature bloat, no enterprise theater
- **Immediate value** — First working decision in under 60 seconds
- **Self-serve first** — No sales calls, no onboarding meetings
- **Progressive disclosure** — Advanced controls hidden until needed
- **Engineering-grade copy** — Direct, action-oriented, zero fluff

## Scripts

```bash
npm run dev       # Start development server (hot reload)
npm run build     # Production build
npm run start     # Start production server
```

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — System design, data models, and flow
- **[Design System](docs/DESIGN_SYSTEM.md)** — Tokens, typography, color, spacing
- **[Development](docs/DEVELOPMENT.md)** — Conventions, patterns, and contribution guide

## License

This project is proprietary. All rights reserved.
