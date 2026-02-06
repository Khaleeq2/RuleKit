# Architecture

RuleKit is built on Next.js 16 App Router with React 19, TypeScript, and a client-side data persistence layer. This document outlines the technical architecture, data flow, and key patterns.

## Tech Stack

### Core Framework
- **Next.js 16.1.6** - App Router for file-based routing
- **React 19.2.3** - UI library with latest features
- **TypeScript 5** - Type safety and developer experience

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **CSS Custom Properties** - Design tokens in `globals.css`
- **Radix UI** - Accessible component primitives

### Data & State
- **localStorage** - Client-side persistence (current implementation)
- **Supabase** - Backend setup (PostgreSQL, migrations ready)
- **React Hooks** - State management

### UI Libraries
- **Lucide React** - Icon system
- **Sonner** - Toast notifications
- **next-themes** - Theme switching (light/dark)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── assets/route.ts
│   │   ├── rules/route.ts
│   │   ├── stats/route.ts
│   │   └── validations/
│   │       ├── route.ts
│   │       └── run/route.ts
│   ├── components/               # Shared components
│   │   ├── ui/                   # Base UI components (Radix)
│   │   ├── DashboardLayout.tsx   # Main dashboard layout
│   │   └── PageHeader.tsx        # Page header component
│   ├── dashboard/                # Dashboard pages
│   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   ├── page.tsx              # Overview page
│   │   ├── rules/                # Rules management
│   │   │   ├── page.tsx         # Rules list
│   │   │   ├── new/page.tsx     # Create rule
│   │   │   ├── [ruleId]/page.tsx # Edit rule
│   │   │   └── _components/
│   │   │       └── RuleEditor.tsx
│   │   ├── validation/
│   │   │   └── page.tsx         # Validation results
│   │   └── assets/
│   │       └── page.tsx         # Asset management
│   ├── lib/                      # Utilities and data layer
│   │   ├── rules.ts              # Rules repository (localStorage)
│   │   └── supabase.ts           # Supabase client
│   ├── globals.css               # Design system tokens
│   └── layout.tsx                # Root layout
└── lib/
    └── utils.ts                   # Shared utilities (cn helper)
```

## Data Layer

### Client-Side Persistence (`rulesRepo`)

Currently, rules are persisted in browser `localStorage` via the `rulesRepo` in `src/app/lib/rules.ts`.

**Pattern**:
```typescript
export const rulesRepo = {
  async list(): Promise<Rule[]>
  async getById(id: string): Promise<Rule | null>
  async create(input: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule>
  async update(id: string, updates: Partial<...>): Promise<Rule>
  async remove(id: string): Promise<void>
  subscribe(callback: () => void): () => void
}
```

**Implementation Details**:
- Uses `localStorage` key: `'rulekit-rules'`
- Auto-seeds with sample data on first load
- Emits custom events for cross-tab synchronization
- Provides subscription API for reactive updates

**Migration Path**: When moving to Supabase, replace `rulesRepo` implementation while keeping the same interface.

### Supabase Setup

Supabase is configured but not fully integrated. The setup includes:

**Database Schema** (`supabase/migrations/20260204_0001_rules.sql`):
- `rules` table with full rule definition
- `rule_conditions` table for structured conditions
- Row Level Security (RLS) policies
- Auto-update triggers for `updated_at`

**Client** (`src/app/lib/supabase.ts`):
- Supabase client initialization
- Ready for authentication and database queries

## Component Architecture

### Layout System

#### Root Layout (`app/layout.tsx`)
- Provides global styles and fonts
- Wraps all pages
- Sets up theme provider

#### Dashboard Layout (`components/DashboardLayout.tsx`)
- Sidebar navigation
- Top bar with search and user menu
- Main content area
- Responsive sidebar collapse

**Pattern**: Layout components wrap page content and provide shared UI.

### Page Components

Pages follow Next.js App Router conventions:
- `page.tsx` - Page component (default export)
- `layout.tsx` - Nested layout (optional)
- `loading.tsx` - Loading UI (optional)
- `error.tsx` - Error UI (optional)

**Example Structure**:
```tsx
// app/dashboard/rules/page.tsx
'use client';

export default function RulesPage() {
  // Component logic
  return <div>...</div>;
}
```

### Shared Components

#### PageHeader (`components/PageHeader.tsx`)
Consistent page headers across the app.

**Variants**:
- `PageHeader` - With back navigation and breadcrumbs
- `PageHeaderSimple` - For top-level pages

**Usage Pattern**:
```tsx
<PageHeader
  title="Page Title"
  backHref="/dashboard/rules"
  breadcrumb={[...]}
  primaryAction={<Button>Save</Button>}
/>
```

#### UI Components (`components/ui/`)
Base components built on Radix UI primitives:
- `card.tsx` - Card container with shadow and transitions
- `button.tsx` - Button with variants
- `collapsible.tsx` - Collapsible content
- `input.tsx`, `textarea.tsx`, `select.tsx` - Form controls
- And more...

**Pattern**: All UI components use `cn()` utility for className merging and support design tokens.

## Routing

### App Router Structure

Next.js 16 App Router uses file-based routing:

```
app/
├── page.tsx                    → /
├── login/page.tsx              → /login
├── signup/page.tsx             → /signup
└── dashboard/
    ├── page.tsx                → /dashboard
    ├── rules/
    │   ├── page.tsx            → /dashboard/rules
    │   ├── new/page.tsx        → /dashboard/rules/new
    │   └── [ruleId]/page.tsx   → /dashboard/rules/:id
    ├── validation/page.tsx     → /dashboard/validation
    └── assets/page.tsx         → /dashboard/assets
```

### Dynamic Routes

- `[ruleId]` - Dynamic segment for rule editing
- Uses `useParams()` to access route parameters

### API Routes

API routes are in `app/api/`:

```
api/
├── rules/route.ts              → GET, POST /api/rules
├── stats/route.ts              → GET /api/stats
├── validations/
│   ├── route.ts                → GET /api/validations
│   └── run/route.ts            → POST /api/validations/run
└── assets/route.ts             → GET, POST /api/assets
```

**Pattern**: API routes export named functions (`GET`, `POST`, etc.) following Next.js conventions.

## State Management

### React Hooks

State is managed using React hooks:

- `useState` - Component-level state
- `useEffect` - Side effects and data fetching
- `useMemo` - Computed values
- `useRouter` - Navigation (Next.js)

### Data Fetching

**Pattern**: Fetch data in `useEffect` on component mount:

```tsx
useEffect(() => {
  async function loadData() {
    const data = await fetch('/api/rules').then(r => r.json());
    setRules(data);
  }
  loadData();
}, []);
```

### Persistence

**Current**: `localStorage` via `rulesRepo`
**Future**: Supabase database

**Pattern**: Repository pattern abstracts persistence layer:
- Components call `rulesRepo` methods
- Repository handles storage details
- Easy to swap implementations

## Key Patterns

### Progressive Disclosure

Implemented in `RuleEditor.tsx`:

1. **Hero Section**: Always visible (rule criteria)
2. **Collapsible Sections**: Metadata (settings, tags)
3. **Gated Sections**: Advanced features (structured conditions)

**State Management**:
```tsx
const [infoExpanded, setInfoExpanded] = useState(!isEditMode);
const [conditionsExpanded, setConditionsExpanded] = useState(false);
```

**Visual Hierarchy**:
- Expanded: White background, shadow, ring highlight
- Collapsed: Muted background, no shadow

### Card Elevation Hierarchy

Cards use shadows to create depth:

1. **Hero cards**: `shadow-md` (strongest)
2. **Standard cards**: `shadow-[var(--shadow-card)]` (default)
3. **Collapsed sections**: No shadow (recede)
4. **Expanded sections**: `shadow-card` + ring (pop forward)

**Implementation**: Applied via className overrides on Card components.

### Consistent Page Headers

All pages use `PageHeader` or `PageHeaderSimple`:

- Consistent spacing and layout
- Breadcrumb navigation
- Primary action placement
- Responsive behavior

### Form Patterns

Forms follow consistent patterns:

1. **Labels**: Use `Label` component
2. **Inputs**: Use `Input`, `Textarea`, `Select` components
3. **Validation**: Client-side validation before submission
4. **Feedback**: Toast notifications via Sonner

## Type Safety

### TypeScript Patterns

**Interfaces**: Define data structures:
```typescript
export interface Rule {
  id: string;
  name: string;
  // ...
}
```

**Type Utilities**: Use TypeScript utilities:
```typescript
type RuleInput = Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>;
```

**Component Props**: Explicit prop types:
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  // ...
}
```

## Performance Considerations

### Code Splitting
Next.js App Router automatically code-splits by route.

### Client Components
Use `'use client'` directive only when needed:
- Interactive components
- Components using hooks
- Components accessing browser APIs

### Server Components
Default to Server Components when possible:
- Static content
- Data fetching (can use async/await)

## Environment Variables

Create `.env.local` for environment-specific config:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Future Architecture Considerations

### Database Migration
When migrating from localStorage to Supabase:
1. Keep `rulesRepo` interface unchanged
2. Replace implementation with Supabase calls
3. Add migration script for existing localStorage data

### Authentication
Supabase Auth is ready to integrate:
- Client configured in `lib/supabase.ts`
- RLS policies in place
- Auth UI components can be added

### Real-time Updates
Supabase Realtime can be added for:
- Live rule updates
- Collaborative editing
- Real-time validation results

## Best Practices

1. **Use design tokens** - Always reference CSS variables
2. **Follow component patterns** - Use existing components before creating new ones
3. **Type everything** - Leverage TypeScript for safety
4. **Progressive enhancement** - Start with core functionality, add complexity progressively
5. **Consistent spacing** - Use design system spacing scale
6. **Accessible components** - Use Radix UI primitives for accessibility
