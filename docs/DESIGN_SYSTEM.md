# Design System

RuleKit's design system is built on a foundation of clarity, intentionality, and restraint. Every design decision serves a purpose.

## Design Philosophy

### Black-and-White Foundation
The interface uses a sophisticated neutral palette as its base. Black (`#111113`) and white (`#ffffff`) create structure and hierarchy. This foundation enables color to be used intentionally—only for status indicators and specific call-to-actions.

### Restrained Color
Color is not decorative; it's functional. When color appears, it communicates meaning:
- **Green**: Success, passed validations
- **Red**: Errors, failed validations
- **Indigo**: Premium features (Upgrade to Pro)
- **Semantic colors**: Used sparingly for warnings, destructive actions

### Progressive Disclosure
Complexity is revealed progressively. The Rule Editor exemplifies this:
- **Primary task** (defining criteria) is always visible
- **Supporting metadata** (settings, tags) is collapsible
- **Advanced features** (structured conditions) are gated

### Premium Aesthetics
Every pixel earns its place. The design emphasizes:
- Intentional spacing and rhythm
- Smooth, purposeful transitions
- Layered depth through shadows
- Crisp borders and clear hierarchy

## Brand Identity

### Logo Usage

**Rule**: "Use the Slate Blue logo anywhere brand expression matters; use the black logo only in dense or utilitarian UI where visual noise must be minimized."

#### ✅ Primary Logo: Slate Blue
Use this as the **default brand logo**.

- **File**: `/public/RuleKit-Slate-Blue.svg`
- **Why**: Feels modern, calm, and intentional. Adds warmth to the B&W UI.
- **Where**: Navigation, marketing pages, onboarding, empty states.

#### ✅ Secondary Logo: Black
Use this **sparingly**.

- **File**: `/public/RuleKit.svg`
- **Why**: Extremely clean, disappears when it should.
- **Where**: Dense UI contexts (tables), exported reports, dark-on-light constraints.

## Design Tokens

All design tokens are defined in `src/app/globals.css` using CSS custom properties. This ensures consistency and enables theme switching.

### Colors

#### Core Palette
```css
--background: #fcfcfd        /* Page background */
--foreground: #111113        /* Primary text */
--card: #ffffff              /* Card backgrounds */
--card-foreground: #111113   /* Text on cards */
--muted: #f6f6f8            /* Subtle backgrounds */
--muted-foreground: #6f6f78 /* Secondary text */
--border: #e7e7ec            /* Borders and dividers */
--input: #e7e7ec             /* Input borders */
--ring: #8b8b95              /* Focus rings */
```

#### Primary Actions
```css
--primary: #18181b           /* Authoritative near-black */
--primary-hover: #27272a
--primary-foreground: #ffffff
```

#### Secondary Elements
```css
--secondary: #f4f4f5
--secondary-hover: #e4e4e7
--secondary-foreground: #18181b
```

#### Accent
```css
--accent: #3f3f46            /* Understated charcoal */
--accent-hover: #52525b
--accent-foreground: #ffffff
```

#### Semantic Colors
```css
--destructive: #ef4444       /* Errors, delete actions */
--success: #10b981           /* Success states */
--warning: #f59e0b           /* Warnings */
```

### Shadows

Shadows create depth and hierarchy. The system uses layered shadows for a premium feel.

#### Standard Shadows
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

#### Card Shadows
```css
--shadow-card: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px -1px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.025)
--shadow-card-hover: 0 12px 36px -14px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(0 0 0 / 0.05)
```

**Usage**: Cards use `shadow-[var(--shadow-card)]` by default. On hover, apply `shadow-[var(--shadow-card-hover)]` for interactive cards.

### Typography

#### Font Stack
```css
--font-display: var(--font-inter), -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif
--font-body: var(--font-inter), -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif
--font-mono: "SF Mono", "Fira Code", "JetBrains Mono", monospace
```

#### Type Scale
```css
--font-size-h1: 28px
--font-size-h2: 22px
--font-size-h3: 18px
--font-size-body: 16px
--font-size-body-sm: 14px
--font-size-meta: 12.5px
```

#### Line Heights
```css
--line-height-h1: 1.25
--line-height-h2: 1.3
--line-height-h3: 1.35
--line-height-body: 1.5
--line-height-body-sm: 1.45
--line-height-meta: 1.35
```

#### Font Weights
```css
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
```

#### Letter Spacing
```css
--tracking-tight: -0.025em
--tracking-normal: 0
--tracking-wide: 0.025em
--tracking-meta-light: 0.02em
--tracking-meta-dark: 0.03em
```

### Spacing Scale

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Border Radius

```css
--radius-sm: 3px
--radius-md: 4px
--radius-lg: 6px
--radius-xl: 8px
--radius-2xl: 12px
--radius-full: 9999px
```

**Usage**: Cards use `rounded-xl` (12px). Buttons use `rounded-lg` (8px) or `rounded-md` (4px).

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

**Usage**: Most interactions use `transition-all duration-200` (maps to `--transition-base`).

### Z-Index Scale

```css
--z-dropdown: 50
--z-sticky: 100
--z-modal: 200
--z-toast: 300
--z-tooltip: 400
```

## Component Patterns

### PageHeader

Consistent page headers with optional breadcrumbs and actions.

**Usage**:
```tsx
import { PageHeader } from '@/app/components/PageHeader';

<PageHeader
  title="Page Title"
  backHref="/dashboard/rules"
  backLabel="Back to Rules"
  breadcrumb={[
    { label: 'Rules', href: '/dashboard/rules' },
    { label: 'Page Title' },
  ]}
  primaryAction={<Button>Save</Button>}
/>
```

**Variants**:
- `PageHeader` - With back button and breadcrumb
- `PageHeaderSimple` - Top-level pages without navigation

### Card

Base card component with shadow and transitions.

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Default Styles**:
- `rounded-xl` border radius
- `shadow-[var(--shadow-card)]` shadow
- `transition-all duration-200` for smooth interactions
- `border` with `border-[var(--border)]`

**Elevation Hierarchy**:
- **Hero cards**: `shadow-md` for primary focus
- **Standard cards**: `shadow-[var(--shadow-card)]` (default)
- **Collapsed sections**: No shadow, muted background
- **Expanded sections**: `shadow-[var(--shadow-card)]` with `ring-1 ring-black/5`

### Collapsible Sections

Progressive disclosure pattern using Radix UI Collapsible.

**Pattern**:
```tsx
<Collapsible open={expanded} onOpenChange={setExpanded}>
  <Card className={expanded 
    ? 'bg-[var(--card)] shadow-[var(--shadow-card)] ring-1 ring-black/5'
    : 'bg-[var(--muted)]/50 shadow-none'
  }>
    <CollapsibleTrigger>
      <CardHeader>
        {/* Header with chevron */}
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

**States**:
- **Collapsed**: Muted background (`bg-[var(--muted)]/50`), no shadow, chevron right (`▶`)
- **Expanded**: White background, shadow, ring highlight, chevron down (`▼`)

### Button Styles

#### Primary Button
Softened black gradient for primary actions.

```tsx
<Button className="bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 shadow-sm hover:from-zinc-700 hover:to-zinc-900 text-white">
  Save Rule
</Button>
```

#### Secondary Button
Outline style for secondary actions.

```tsx
<Button variant="outline">Cancel</Button>
```

#### Ghost Button
Minimal style for tertiary actions.

```tsx
<Button variant="ghost">Learn More</Button>
```

**Rule**: Only one filled (primary) button per page. Others should be outline or ghost.

### Status Badges

Glassy/outline style for status indicators.

```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-emerald-500/5 text-emerald-700 border-emerald-500/20">
  Passed
</span>
```

**Pattern**: `bg-{color}-500/5 text-{color}-700 border border-{color}-500/20`

## UI Principles

### Progressive Disclosure

**Rule**: If a user doesn't need it to decide their next action, it shouldn't ask for attention yet.

**Implementation**:
- Primary task is always visible
- Supporting metadata is collapsible
- Advanced features are gated (collapsed by default)

**Example**: Rule Editor
- **Hero**: Rule criteria (always visible)
- **Collapsible**: Rule settings (metadata)
- **Gated**: Structured conditions (advanced)

### Card Elevation Hierarchy

Cards use shadows to create visual hierarchy:

1. **Hero cards** (`shadow-md`): Primary focus, strongest elevation
2. **Standard cards** (`shadow-[var(--shadow-card)]`): Default elevation
3. **Collapsed sections** (no shadow): Recede into background
4. **Expanded sections** (`shadow-card` + ring): Pop forward

### Hover States

Interactive cards should provide clear feedback:

```tsx
className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-zinc-300 dark:hover:border-zinc-700"
```

**Pattern**:
- Shadow increases on hover
- Border darkens slightly
- Smooth transitions (`duration-200`)

### Dark Mode

All design tokens support dark mode via `.dark` class or `[data-theme="dark"]` attribute.

**Key Differences**:
- Backgrounds: Dark (`#09090b`) instead of light (`#fcfcfd`)
- Cards: Dark (`#0f0f12`) instead of white
- Borders: Lighter (`#27272a`) for visibility
- Shadows: Adjusted for dark backgrounds

## Usage Guidelines

### When to Use Design Tokens

**Always use CSS variables** instead of hardcoded values:
- ✅ `bg-[var(--card)]`
- ❌ `bg-white`

**Exception**: Semantic colors (success, error) can use Tailwind classes:
- ✅ `text-emerald-600`
- ✅ `bg-red-500/10`

### When to Create New Components

Create a new component when:
- The pattern is reused 3+ times
- It encapsulates complex logic
- It needs its own state management

Extend existing components when:
- Simple styling variations
- One-off use cases
- Minor modifications

### Card Styling Guidelines

1. **Always use the Card component** for containers
2. **Apply elevation** based on hierarchy (hero > standard > collapsed)
3. **Add hover states** for interactive cards
4. **Use consistent padding** (`p-6` or `p-8` for content)
5. **Maintain border radius** (`rounded-xl` for cards)

## Animation Utilities

Pre-defined animations in `globals.css`:

- `animate-fade-in`: Simple fade
- `animate-fade-in-up`: Fade with upward motion
- `animate-scale-in`: Scale from 95% to 100%
- `animate-slide-in-right`: Slide from right

**Usage**: Apply to elements that appear dynamically.

## Spotlight Surfaces

Subtle gradient overlays for emphasis:

- `.spotlight`: Neutral gradient
- `.spotlight-cool`: Indigo-tinted gradient
- `.spotlight-warm`: Amber-tinted gradient
- `.spotlight-neutral`: Subtle black gradient

**Usage**: Apply to card headers or sections that need subtle emphasis.
