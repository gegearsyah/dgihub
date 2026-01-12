# Frontend Design Specification 📐

Complete design system documentation for creating apps with similar design, animations, icons, and styling patterns.

---

## 🎨 Design System Overview

### Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion 12.23.26 + Tailwind CSS Animate
- **Icons**: Lucide React 0.462.0
- **Theme Management**: next-themes 0.4.4
- **Font**: Plus Jakarta Sans (Google Fonts)

---

## 🎨 Color Palette

### Light Mode Colors

```css
/* Primary - Deep Navy (Trust, Government) */
--primary: 220 70% 18%
--primary-foreground: 45 100% 96%

/* Secondary - Rich Gold (Achievement, Indonesia) */
--secondary: 38 92% 50%
--secondary-foreground: 220 70% 10%

/* Background & Surfaces */
--background: 220 20% 98%
--foreground: 220 70% 12%
--card: 0 0% 100%
--card-foreground: 220 70% 12%

/* Muted & Accent */
--muted: 220 15% 94%
--muted-foreground: 220 10% 45%
--accent: 38 92% 95%
--accent-foreground: 38 92% 30%

/* States */
--destructive: 0 72% 51%
--destructive-foreground: 0 0% 100%
--success: 152 76% 36%
--success-foreground: 0 0% 100%
--warning: 38 92% 50%
--warning-foreground: 220 70% 10%

/* Borders & Input */
--border: 220 20% 90%
--input: 220 20% 90%
--ring: 220 70% 18%

/* Border Radius */
--radius: 0.75rem
```

### Dark Mode Colors

```css
/* Primary - Gold (for buttons, highlights) */
--primary: 38 92% 50%
--primary-foreground: 220 70% 10%

/* Secondary - Navy (for secondary elements) */
--secondary: 220 60% 30%
--secondary-foreground: 220 20% 95%

/* Background - Deep Navy */
--background: 220 70% 8%
--foreground: 220 20% 95%
--card: 220 60% 12%
--card-foreground: 220 20% 95%

/* Muted - Medium navy */
--muted: 220 50% 18%
--muted-foreground: 220 15% 70%

/* Accent - Gold tinted */
--accent: 38 60% 20%
--accent-foreground: 38 92% 70%

/* Borders */
--border: 220 50% 25%
--input: 220 50% 25%
--ring: 38 92% 50%
```

### Role-Based Colors (Multi-tenant)

```css
/* Mitra (Training Provider) */
--mitra-primary: 250 84% 67%
--mitra-secondary: 250 84% 57%

/* Talenta (Learner) */
--talenta-primary: 38 92% 50%
--talenta-secondary: 38 92% 40%

/* Industri (Employer) */
--industri-primary: 217 91% 60%
--industri-secondary: 217 91% 50%
```

### Sidebar Colors

```css
--sidebar-background: 220 70% 18%
--sidebar-foreground: 220 20% 95%
--sidebar-primary: 38 92% 50%
--sidebar-primary-foreground: 220 70% 10%
--sidebar-accent: 220 60% 25%
--sidebar-accent-foreground: 220 20% 95%
--sidebar-border: 220 50% 25%
--sidebar-ring: 38 92% 50%
```

### Custom Gradients

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, hsl(220 70% 18%) 0%, hsl(220 60% 28%) 100%)

/* Gold Gradient */
--gradient-gold: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(45 95% 58%) 100%)

/* Hero Gradient */
--gradient-hero: linear-gradient(180deg, hsl(220 70% 18%) 0%, hsl(220 60% 25%) 50%, hsl(220 50% 35%) 100%)

/* Card Gradient */
--gradient-card: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 98%) 100%)
```

### Shadow System

```css
--shadow-sm: 0 1px 2px 0 hsl(220 70% 18% / 0.05)
--shadow-md: 0 4px 6px -1px hsl(220 70% 18% / 0.08), 0 2px 4px -2px hsl(220 70% 18% / 0.05)
--shadow-lg: 0 10px 15px -3px hsl(220 70% 18% / 0.1), 0 4px 6px -4px hsl(220 70% 18% / 0.05)
--shadow-xl: 0 20px 25px -5px hsl(220 70% 18% / 0.1), 0 8px 10px -6px hsl(220 70% 18% / 0.05)
--shadow-gold: 0 4px 14px 0 hsl(38 92% 50% / 0.35)
```

---

## 📝 Typography

### Font Family
- **Primary Font**: `Plus Jakarta Sans`
- **Weights**: 300, 400, 500, 600, 700, 800
- **Fallback**: `system-ui, sans-serif`

### Font Sizes & Hierarchy

```css
/* Headings */
h1: text-4xl md:text-5xl lg:text-6xl (Hero)
h2: text-3xl md:text-4xl (Section Headers)
h3: text-xl md:text-2xl (Card Titles)
h4: text-lg (Subsection Titles)

/* Body */
body: text-base (16px)
small: text-sm (14px)
xs: text-xs (12px)

/* Font Weights */
light: font-light (300)
normal: font-normal (400)
medium: font-medium (500)
semibold: font-semibold (600)
bold: font-bold (700)
extrabold: font-extrabold (800)
```

### Typography Utilities

```css
.text-gradient-primary  /* Gradient text using primary gradient */
.text-gradient-gold      /* Gradient text using gold gradient */
```

---

## 🎭 Animations

### Keyframe Animations

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px) }
  to { opacity: 1; transform: translateY(0) }
}

/* Fade In Up */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px) }
  to { opacity: 1; transform: translateY(0) }
}

/* Slide In Right */
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px) }
  to { opacity: 1; transform: translateX(0) }
}

/* Scale In */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95) }
  to { opacity: 1; transform: scale(1) }
}

/* Pulse Glow */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--secondary) / 0.4) }
  50% { box-shadow: 0 0 0 8px hsl(var(--secondary) / 0) }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
}

/* Shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
```

### Animation Classes

```css
.animate-fade-in          /* 0.5s ease-out */
.animate-fade-in-up       /* 0.6s ease-out */
.animate-slide-in-right   /* 0.5s ease-out */
.animate-scale-in         /* 0.3s ease-out */
.animate-pulse-glow       /* 2s ease-in-out infinite */
.animate-float            /* 6s ease-in-out infinite */
.animate-shimmer          /* 2s linear infinite */
```

### Usage Examples

```tsx
// Staggered animations
<div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>

// Group hover animations
<div className="group hover:scale-110 transition-transform">

// Button press animation
<button className="active:scale-[0.98] transition-transform">
```

### Transition Patterns

```css
/* Standard Transitions */
transition-all duration-200    /* Quick transitions */
transition-all duration-300    /* Standard transitions */
transition-colors              /* Color only */
transition-transform           /* Transform only */

/* Hover Effects */
hover:scale-110                /* Scale up on hover */
hover:bg-muted/50              /* Background change */
hover:border-primary/50        /* Border color change */
group-hover:scale-110          /* Group hover scale */
```

---

## 🎯 Icons

### Icon Library
- **Library**: `lucide-react` (v0.462.0)
- **Style**: Outline style, consistent stroke width
- **Size Standard**: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)

### Common Icons Used

```tsx
// Navigation
Home, Menu, X, ChevronRight, ChevronDown

// Education
BookOpen, GraduationCap, Award, FileText, ClipboardList

// Business
Briefcase, Building2, Users, TrendingUp, Search

// Actions
ArrowRight, CheckCircle2, Shield, Sparkles, Mail

// Theme
Sun, Moon, Globe

// Status
CheckCircle2, AlertCircle, XCircle
```

### Icon Usage Pattern

```tsx
import { IconName } from "lucide-react";

// Standard usage
<IconName className="w-5 h-5 text-primary" />

// In buttons
<Button>
  <IconName className="w-4 h-4" />
  Label
</Button>

// With hover effects
<IconName className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
```

---

## 🧩 Component Patterns

### Button Variants

```tsx
// Variants
default      // Primary action
destructive  // Delete/danger actions
outline      // Secondary action
secondary    // Gold/secondary color
ghost        // Minimal style
link         // Text link style
hero         // Gradient hero button
heroOutline  // Outlined hero button
success      // Success actions

// Sizes
sm    // h-9, px-3, text-xs
default // h-11, px-5
lg    // h-12, px-8, text-base
xl    // h-14, px-10, text-lg
icon  // h-10 w-10 (square)
```

### Card Pattern

```tsx
<Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Badge/Status Pattern

```tsx
// Status badges
<span className="px-3 py-1 text-xs font-medium rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
  ACTIVE
</span>

// Info badges
<span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
  Label
</span>
```

### Avatar Pattern

```tsx
<Avatar className="w-10 h-10">
  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
    {getInitials(name)}
  </AvatarFallback>
</Avatar>
```

### Navigation Item Pattern

```tsx
<Link
  href="/path"
  className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
    "hover:bg-muted/50",
    active
      ? "bg-primary/10 text-primary border-l-4 border-primary"
      : "text-muted-foreground hover:text-foreground"
  )}
>
  <Icon className="h-5 w-5" />
  <span className="font-medium">Label</span>
</Link>
```

---

## 🎨 Layout Patterns

### Container

```tsx
<div className="container">
  {/* Content with max-width and padding */}
</div>
```

### Hero Section Pattern

```tsx
<section className="relative min-h-screen bg-gradient-hero overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-hero-pattern opacity-60" />
  <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl" />
  
  <div className="container relative pt-32 pb-20 md:pt-40 md:pb-32">
    {/* Content */}
  </div>
  
  {/* Bottom Wave SVG */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg>{/* Wave path */}</svg>
  </div>
</section>
```

### Grid Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Feature cards
<div className="grid md:grid-cols-3 gap-6">

// Stats row
<div className="grid grid-cols-3 gap-6">
```

### Sidebar Pattern

```tsx
<aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
  {/* Logo */}
  <div className="flex items-center gap-3 p-6 border-b border-border">
    <div className="w-10 h-10 rounded-lg bg-gradient-primary">
      <span className="text-primary-foreground font-bold">D</span>
    </div>
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto p-4 space-y-1">
    {/* Nav items */}
  </nav>
  
  {/* Footer */}
  <div className="p-4 border-t border-border">
    {/* User info */}
  </div>
</aside>
```

---

## 🎨 Background Patterns

### Hero Pattern

```css
.bg-hero-pattern {
  background: radial-gradient(
    ellipse at top,
    hsl(var(--secondary) / 0.15) 0%,
    transparent 50%
  );
}
```

### Card Shine

```css
.bg-card-shine {
  background: linear-gradient(
    110deg,
    transparent 25%,
    hsl(var(--secondary) / 0.1) 50%,
    transparent 75%
  );
}
```

### Glassmorphism

```tsx
<div className="bg-card/50 border border-border backdrop-blur-sm">
  {/* Glass effect */}
</div>
```

---

## 🎨 Spacing System

### Standard Spacing (Tailwind)

```css
/* Padding */
p-2   /* 0.5rem / 8px */
p-4   /* 1rem / 16px */
p-6   /* 1.5rem / 24px */
p-8   /* 2rem / 32px */

/* Gap */
gap-2  /* 0.5rem */
gap-4  /* 1rem */
gap-6  /* 1.5rem */
gap-8  /* 2rem */

/* Margin */
mb-4   /* margin-bottom: 1rem */
mt-6   /* margin-top: 1.5rem */
```

### Section Spacing

```tsx
// Standard section
<section className="py-20 md:py-32">

// Hero section
<section className="pt-32 pb-20 md:pt-40 md:pb-32">
```

---

## 🎨 Border Radius

```css
/* Standard */
rounded-lg      /* 0.75rem / var(--radius) */
rounded-md      /* calc(var(--radius) - 2px) */
rounded-sm      /* calc(var(--radius) - 4px) */
rounded-xl      /* calc(var(--radius) + 4px) */
rounded-2xl     /* calc(var(--radius) + 8px) */
rounded-full    /* Full circle */
```

---

## 🎨 Shadows

### Utility Classes

```css
.shadow-card          /* var(--shadow-md) */
.shadow-card-hover    /* var(--shadow-lg) */
.shadow-gold          /* var(--shadow-gold) */
```

### Usage

```tsx
<Card className="shadow-card hover:shadow-card-hover transition-all">
```

---

## 🎨 Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 0.3);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.5);
}
```

---

## 🎨 Focus Styles

```css
:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: hsl(var(--ring));
  ring-offset: 2px;
  ring-offset-color: hsl(var(--background));
}
```

---

## 🎨 Responsive Breakpoints

```css
/* Tailwind Default */
sm:  640px   /* Small devices */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1400px  /* Large desktops (custom) */
```

### Usage

```tsx
<div className="text-2xl md:text-3xl lg:text-4xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="hidden md:flex">
```

---

## 🎨 Theme System

### Theme Provider Setup

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

<ThemeProvider>
  {children}
</ThemeProvider>
```

### Theme Toggle

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

### Dark Mode Implementation

- Uses `next-themes` for theme management
- Class-based dark mode: `darkMode: ["class"]`
- Default theme: `dark`
- System theme: Disabled (`enableSystem={false}`)

---

## 🎨 Component Library (shadcn/ui)

### Installation

```bash
npx shadcn@latest init
```

### Configuration (components.json)

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Available Components

- Accordion
- Alert Dialog
- Avatar
- Button
- Card
- Checkbox
- Dialog
- Dropdown Menu
- Input
- Label
- Popover
- Progress
- Radio Group
- Select
- Separator
- Slider
- Switch
- Tabs
- Toast
- Tooltip

---

## 🎨 Utility Functions

### cn() - Class Name Merger

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
```

---

## 🎨 Animation Best Practices

### Staggered Animations

```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {item.content}
  </div>
))}
```

### Group Hover Effects

```tsx
<div className="group">
  <Icon className="group-hover:scale-110 transition-transform" />
  <Text className="group-hover:text-primary transition-colors" />
</div>
```

### Button Interactions

```tsx
<Button className="active:scale-[0.98] transition-transform">
  Click Me
</Button>
```

---

## 🎨 Loading States

### Skeleton Pattern

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>
```

### Shimmer Effect

```tsx
<div className="animate-shimmer bg-gradient-to-r from-transparent via-muted to-transparent">
  {/* Content */}
</div>
```

---

## 🎨 Form Patterns

### Input Styling

```tsx
<Input
  className="border-border focus:ring-ring"
  placeholder="Enter text..."
/>
```

### Form Validation

- Uses `react-hook-form` with `zod` validation
- Error states use `destructive` color
- Success states use `success` color

---

## 🎨 Mobile Patterns

### Mobile Menu

```tsx
{/* Mobile Menu Button */}
<Button
  variant="ghost"
  size="icon"
  className="lg:hidden fixed top-4 left-4 z-50"
  onClick={() => setIsOpen(!isOpen)}
>
  {isOpen ? <X /> : <Menu />}
</Button>

{/* Mobile Overlay */}
{isOpen && (
  <div
    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
    onClick={() => setIsOpen(false)}
  />
)}
```

### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden">
  {/* Navigation items */}
</nav>
```

---

## 🎨 Accessibility

### Focus Management

- All interactive elements have visible focus states
- Keyboard navigation supported
- ARIA labels on icon-only buttons

### Color Contrast

- All text meets WCAG AA standards
- Dark mode optimized for readability

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-*": "Latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.4.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "tailwindcss": "^3.4.17"
  }
}
```

---

## 🚀 Quick Start Checklist

1. ✅ Install dependencies
2. ✅ Set up Tailwind CSS with config
3. ✅ Configure `globals.css` with color variables
4. ✅ Set up `components.json` for shadcn/ui
5. ✅ Install shadcn/ui components
6. ✅ Configure theme provider
7. ✅ Add Plus Jakarta Sans font
8. ✅ Set up icon library (lucide-react)
9. ✅ Configure animations in `tailwind.config.ts`
10. ✅ Test dark/light mode switching

---

## 📝 Design Principles

1. **Consistency**: Use design tokens (colors, spacing, typography)
2. **Accessibility**: WCAG AA compliant, keyboard navigation
3. **Performance**: Optimize animations, lazy load components
4. **Responsive**: Mobile-first approach
5. **Dark Mode**: Full support with proper contrast
6. **Animations**: Subtle, purposeful, performant
7. **Icons**: Consistent size and style (lucide-react)
8. **Typography**: Clear hierarchy, readable fonts

---

## 🎯 Common Patterns Summary

### Hero Section
- Gradient background with blur effects
- Animated fade-in elements
- Stats row with dividers
- Feature cards with hover effects
- Wave SVG at bottom

### Cards
- Rounded corners (rounded-lg or rounded-2xl)
- Border with hover state
- Shadow that increases on hover
- Glassmorphism option (backdrop-blur)

### Navigation
- Sidebar with logo, nav items, user footer
- Active state with left border and background
- Icon + text layout
- Mobile responsive with overlay

### Buttons
- Multiple variants for different contexts
- Active scale animation (scale-[0.98])
- Icon support with proper spacing
- Size variants for hierarchy

### Status Indicators
- Badge pattern with color coding
- Rounded-full for pills
- Border + background + text color
- Opacity-based colors for dark mode

---

**Last Updated**: Based on DGIHub Application frontend
**Version**: 1.0.0
