# Development Guide

This guide covers setup, development workflows, code standards, and best practices for contributing to RuleKit.

## Setup

### Prerequisites

- **Node.js**: 20+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm**: Comes with Node.js
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rulekit-v0.2

# Install dependencies
npm install --legacy-peer-deps

# Note: --legacy-peer-deps is required due to React 19 peer dependency conflicts
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server uses Next.js Turbopack for fast refresh and hot module replacement.

### Build

```bash
npm run build
npm start
```

Builds the application for production and starts the production server.

## Development Workflow

### File Organization

Follow the established project structure:

- **Pages**: `src/app/{route}/page.tsx`
- **Components**: `src/app/components/` (shared) or `src/app/{route}/_components/` (route-specific)
- **Utilities**: `src/app/lib/` (app-specific) or `src/lib/` (shared)
- **Styles**: `src/app/globals.css` (design tokens)

### Component Creation

#### When to Create a New Component

Create a new component when:
- The pattern is reused 3+ times
- It encapsulates complex logic or state
- It needs its own file for clarity

#### Component Structure

```tsx
'use client'; // Only if needed (hooks, interactivity)

import { ... } from '...';

interface ComponentProps {
  // Explicit prop types
  title: string;
  subtitle?: string;
}

export function Component({ title, subtitle }: ComponentProps) {
  // Component logic
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Guidelines**:
- Use TypeScript interfaces for props
- Export named functions (not default)
- Use `'use client'` only when necessary
- Keep components focused and single-purpose

### Styling Approach

#### Design Tokens

**Always use CSS variables** from the design system:

```tsx
// ✅ Correct
<div className="bg-[var(--card)] text-[var(--foreground)]">
<div className="shadow-[var(--shadow-card)]">

// ❌ Incorrect
<div className="bg-white text-black">
<div className="shadow-md">
```

#### Tailwind Utilities

Use Tailwind utilities for layout and spacing:

```tsx
<div className="flex items-center gap-4 p-6 rounded-xl">
```

#### Combining Approaches

```tsx
// Design token for color + Tailwind for layout
<div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 flex items-center gap-4">
```

### Code Standards

#### TypeScript

**Always type props and return values**:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps): JSX.Element {
  // ...
}
```

**Use type utilities**:

```tsx
type RuleInput = Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>;
type RuleUpdate = Partial<Omit<Rule, 'id' | 'createdAt'>>;
```

#### Naming Conventions

- **Components**: PascalCase (`PageHeader`, `RuleEditor`)
- **Files**: Match component name (`PageHeader.tsx`)
- **Functions**: camelCase (`handleSave`, `loadRules`)
- **Constants**: UPPER_SNAKE_CASE (`RULE_CATEGORIES`)
- **CSS Variables**: kebab-case (`--shadow-card`)

#### Component Structure Order

1. Imports (external, then internal)
2. Type definitions
3. Component function
4. Helper functions (if needed)
5. Export

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';

interface Props {
  // ...
}

export function Component({ ... }: Props) {
  // State
  // Effects
  // Handlers
  // Render
}
```

## Design System Usage

### Using Design Tokens

Reference the [Design System](./DESIGN_SYSTEM.md) for complete token reference.

**Colors**:
```tsx
className="bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]"
```

**Shadows**:
```tsx
className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
```

**Spacing**:
Use Tailwind spacing scale (maps to design tokens):
```tsx
className="p-6 gap-4" // p-6 = 24px, gap-4 = 16px
```

### Card Styling

**Always use the Card component**:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Elevation Guidelines**:
- Hero cards: Add `shadow-md` className
- Standard cards: Default `shadow-[var(--shadow-card)]`
- Interactive cards: Add `hover:shadow-[var(--shadow-card-hover)]`
- Collapsed sections: Remove shadow, use muted background

### Button Patterns

**Primary Action** (one per page):
```tsx
<Button className="bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 shadow-sm hover:from-zinc-700 hover:to-zinc-900 text-white">
  Save Rule
</Button>
```

**Secondary Actions**:
```tsx
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Learn More</Button>
```

### Page Headers

Use `PageHeader` for pages with navigation:

```tsx
import { PageHeader } from '@/app/components/PageHeader';

<PageHeader
  title="Page Title"
  backHref="/dashboard/rules"
  breadcrumb={[
    { label: 'Rules', href: '/dashboard/rules' },
    { label: 'Page Title' },
  ]}
  primaryAction={<Button>Save</Button>}
/>
```

Use `PageHeaderSimple` for top-level pages:

```tsx
import { PageHeaderSimple } from '@/app/components/PageHeader';

<PageHeaderSimple
  title="Overview"
  subtitle="Dashboard metrics and activity"
  primaryAction={<Button>Execute</Button>}
/>
```

## Common Patterns

### Data Fetching

```tsx
'use client';

import { useEffect, useState } from 'react';

export function Component() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/rules');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render data */}</div>;
}
```

### Form Handling

```tsx
const [formData, setFormData] = useState({ name: '', description: '' });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await rulesRepo.create(formData);
    toast.success('Rule created');
    router.push('/dashboard/rules');
  } catch (error) {
    toast.error('Failed to create rule');
  }
};

<form onSubmit={handleSubmit}>
  <Input
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  />
  <Button type="submit">Save</Button>
</form>
```

### Progressive Disclosure

```tsx
const [expanded, setExpanded] = useState(false);

<Collapsible open={expanded} onOpenChange={setExpanded}>
  <Card className={expanded 
    ? 'bg-[var(--card)] shadow-[var(--shadow-card)] ring-1 ring-black/5'
    : 'bg-[var(--muted)]/50 shadow-none'
  }>
    <CollapsibleTrigger>
      <CardHeader>
        <CardTitle>Section Title</CardTitle>
        {expanded ? <ChevronDown /> : <ChevronRight />}
      </CardHeader>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <CardContent>
        {/* Collapsible content */}
      </CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>
```

## Debugging

### Browser DevTools

- **React DevTools**: Inspect component tree and state
- **Network Tab**: Check API requests and responses
- **Console**: Check for errors and warnings

### Common Issues

**Build Errors**:
- Check TypeScript errors: `npm run build`
- Verify all imports are correct
- Ensure components are properly exported

**Styling Issues**:
- Verify CSS variables are defined in `globals.css`
- Check Tailwind classes are valid
- Inspect computed styles in DevTools

**Data Issues**:
- Check localStorage in DevTools (Application tab)
- Verify `rulesRepo` methods are called correctly
- Check API route responses

## Testing

*Testing infrastructure to be added in future updates.*

## Build & Deploy

### Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Production Build

```bash
npm run build
```

The build process:
1. Compiles TypeScript
2. Optimizes images and assets
3. Generates static pages where possible
4. Creates optimized production bundle

### Deployment

*Deployment instructions to be added based on hosting platform.*

## Best Practices Summary

1. **Use design tokens** - Always reference CSS variables, never hardcode colors
2. **Follow component patterns** - Use existing components before creating new ones
3. **Type everything** - Leverage TypeScript for type safety
4. **Progressive disclosure** - Reveal complexity only when needed
5. **Consistent spacing** - Use design system spacing scale
6. **Accessible components** - Use Radix UI primitives for accessibility
7. **One primary action** - Only one filled button per page
8. **Card elevation** - Use shadows to create visual hierarchy
9. **Smooth transitions** - Use `transition-all duration-200` for interactions
10. **Client components** - Use `'use client'` only when necessary

## Getting Help

- Check [Design System](./DESIGN_SYSTEM.md) for styling questions
- Check [Architecture](./ARCHITECTURE.md) for technical patterns
- Review existing components for examples
- Check Next.js and React documentation for framework-specific questions

## Contributing

When contributing:

1. Follow the code standards outlined above
2. Use the design system tokens
3. Maintain TypeScript type safety
4. Test your changes locally
5. Update documentation if adding new patterns
