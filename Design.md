# DESIGN.md

# Project Design System
Inspired by cinematic futuristic clean-energy interfaces.

---

# Overview

This design language combines:

- Futuristic industrial minimalism
- Deep cinematic gradients
- Cool cyan/teal atmospheres
- High contrast typography
- Reflective surfaces
- Soft glow accents
- Environmental sci-fi aesthetics

The overall feeling should be:

- Premium
- Technical
- Calm
- Intelligent
- Sustainable
- Atmospheric
- Powerful
- Beautifully engineered

The UI should resemble:
- Advanced energy systems
- Cinematic product launches
- Luxury technology brands
- Industrial sci-fi interfaces

Avoid:
- Loud startup aesthetics
- Cartoon visuals
- Bright rainbow palettes
- Cluttered dashboards
- Heavy neumorphism
- Excessive shadows
- Dense UI layouts

---

# Brand Personality

The experience should feel:

- Futuristic
- Atmospheric
- Elegant
- Minimal
- Sustainable
- Intelligent
- Technical
- Quiet but powerful

The interface should communicate:

> “Next-generation clean technology meets cinematic sci-fi minimalism.”

---

# Core Design Philosophy

## 1. Cinematic Minimalism

Every screen should feel immersive and spacious.

Use:
- Large negative space
- Oversized typography
- Slow motion
- Atmospheric gradients
- Layered depth
- Minimal UI chrome

Do NOT:
- Overcrowd components
- Use too many cards
- Add unnecessary dividers
- Use excessive borders
- Fill empty space unnecessarily

---

## 2. Environmental Futurism

Visual language should feel connected to:
- Water
- Light
- Fog
- Reflections
- Metallic surfaces
- Energy systems
- Natural landscapes

Textures should feel:
- Smooth
- Reflective
- Soft
- Diffused

---

# Primary Color Palette

| Role | Hex | Usage |
|---|---|---|
| Deep Midnight | `#003135` | Main backgrounds, navbars, dark sections |
| Ocean Teal | `#024950` | Cards, secondary surfaces |
| Burnt Copper | `#964734` | Accent highlights, hover states |
| Electric Cyan | `#0FA4AF` | Interactive elements, active indicators |
| Mist Blue | `#AFDDE5` | Text contrast, subtle surfaces |

---

# Semantic Color Tokens

## Backgrounds

```css
--bg-primary: #003135;
--bg-secondary: #024950;
--bg-tertiary: #01252A;

--surface-glass: rgba(2, 73, 80, 0.42);
--surface-soft: rgba(175, 221, 229, 0.08);

--overlay-dark: rgba(0, 0, 0, 0.35);
--overlay-heavy: rgba(0, 0, 0, 0.55);
```

---

## Accent Colors

```css
--accent-primary: #0FA4AF;
--accent-hover: #13B8C4;
--accent-secondary: #964734;
```

---

## Text Colors

```css
--text-primary: #F4FBFD;
--text-secondary: #AFDDE5;
--text-muted: rgba(175, 221, 229, 0.72);
--text-disabled: rgba(175, 221, 229, 0.4);
```

---

## Borders & Effects

```css
--border-subtle: rgba(175, 221, 229, 0.1);
--border-soft: rgba(175, 221, 229, 0.16);
--border-active: rgba(15, 164, 175, 0.5);

--shadow-deep: rgba(0, 0, 0, 0.45);
--shadow-soft: rgba(0, 0, 0, 0.22);

--glow-cyan: rgba(15, 164, 175, 0.45);
--glow-cyan-strong: rgba(15, 164, 175, 0.75);
```

---

# Gradient System

## Primary Hero Gradient

```css
background: linear-gradient(
  135deg,
  #003135 0%,
  #024950 45%,
  #0FA4AF 100%
);
```

---

## Atmospheric Overlay

```css
background: linear-gradient(
  to bottom,
  rgba(0, 49, 53, 0.05),
  rgba(0, 49, 53, 0.85)
);
```

---

## Cyan Glow Gradient

```css
background: radial-gradient(
  circle,
  rgba(15, 164, 175, 0.45),
  transparent 70%
);
```

---

## Metallic Surface Gradient

```css
background: linear-gradient(
  180deg,
  rgba(255,255,255,0.08),
  rgba(255,255,255,0.01)
);
```

---

# Typography System

## Typography Direction

Typography should feel:
- Thin
- Elegant
- Spacious
- Clean
- Modern

Use light weights heavily.

---

# Recommended Fonts

## Headings

Preferred:
- Inter Tight
- Space Grotesk
- Sora

Fallback:
- Inter
- system-ui

---

## Body Fonts

Preferred:
- Inter
- Manrope

Fallback:
- system-ui

---

# Typography Scale

| Usage | Size | Weight | Letter Spacing |
|---|---|---|---|
| Hero Display | 96px | 200 | -0.05em |
| Hero Title | 72px | 300 | -0.04em |
| Section Heading | 48px | 300 | -0.03em |
| Card Heading | 28px | 400 | -0.02em |
| Body Large | 20px | 400 | -0.01em |
| Body | 16px | 400 | 0 |
| Small Text | 14px | 400 | 0 |
| Label | 12px | 600 | 0.18em |

---

# Layout Principles

## Layout Direction

Layouts should feel:
- Wide
- Cinematic
- Horizontal
- Airy

Use:
- Fullscreen hero sections
- Large content spacing
- Floating modules
- Layered depth

Avoid:
- Tight containers
- Crowded grids
- Excessive nested cards

---

# Spacing System

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 40px |
| 2xl | 64px |
| 3xl | 96px |
| 4xl | 140px |

---

# Border Radius

| Usage | Radius |
|---|---|
| Small Inputs | 12px |
| Cards | 24px |
| Large Panels | 32px |
| Buttons | 999px |

---

# Glassmorphism Surface Style

Use for:
- Floating cards
- Navigation
- Modals
- Feature panels

```css
backdrop-filter: blur(12px);

background: rgba(2, 73, 80, 0.42);

border: 1px solid rgba(175, 221, 229, 0.14);

box-shadow:
  0 10px 30px rgba(0,0,0,0.22);
```

---

# Buttons

## Primary Button

```css
background: #0FA4AF;
color: white;

padding: 14px 28px;

border-radius: 999px;

transition: all 0.45s ease;
```

---

## Primary Button Hover

```css
transform: translateY(-2px);

box-shadow:
  0 0 24px rgba(15, 164, 175, 0.45);
```

---

## Secondary Button

```css
background: transparent;

border:
  1px solid rgba(175, 221, 229, 0.18);

color: #AFDDE5;

backdrop-filter: blur(8px);
```

---

# Input Fields

```css
background:
  rgba(255,255,255,0.04);

border:
  1px solid rgba(175,221,229,0.1);

color:
  #F4FBFD;

padding:
  16px 20px;

border-radius:
  16px;
```

---

# Navigation Style

Navigation should:
- Float over content
- Use transparency
- Feel lightweight
- Avoid solid bars

Preferred:
- Blur backgrounds
- Thin dividers
- Small uppercase labels

---

# Motion Design

# Animation Philosophy

Motion should feel:
- Smooth
- Slow
- Cinematic
- Floating
- Organic

Avoid:
- Bouncy animations
- Aggressive motion
- Fast transitions

---

# Standard Transition

```css
transition:
  all 0.45s ease;
```

---

# Slow Cinematic Transition

```css
transition:
  all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
```

---

# Recommended Motion Effects

Use:
- Parallax scrolling
- Slow fades
- Water ripple effects
- Floating hover motion
- Soft glow pulsing
- Opacity transitions
- Ambient particles

---

# Imagery Direction

Preferred imagery:
- Water reflections
- Mountain silhouettes
- Atmospheric fog
- Cyan lighting
- Industrial machinery
- Metallic surfaces
- Environmental technology
- Minimal landscapes

Image treatment:
- Desaturated
- Cool-toned
- Cinematic contrast
- Soft bloom lighting

---

# Accessibility

Maintain:
- WCAG AA contrast minimum
- Clear focus states
- Readable typography
- Motion reduction support

Never:
- Use low-contrast body text
- Depend only on color for meaning

---

# Tailwind Theme Example

```js
theme: {
  extend: {
    colors: {
      midnight: '#003135',
      tealDeep: '#024950',
      copper: '#964734',
      cyan: '#0FA4AF',
      mist: '#AFDDE5',
    },

    borderRadius: {
      xl2: '24px',
      xl3: '32px',
    },

    boxShadow: {
      glow: '0 0 24px rgba(15,164,175,0.45)',
    }
  }
}
```

---

# UI Keywords

When generating components or layouts, optimize for:

- cinematic
- immersive
- futuristic
- atmospheric
- premium
- reflective
- minimal
- intelligent
- sustainable
- elegant
- calm
- industrial sci-fi

---

# Quick Usage Rules

1. Use dark backgrounds first.
2. Use cyan sparingly for emphasis.
3. Keep typography oversized and airy.
4. Prefer transparency over solid panels.
5. Use cinematic lighting and gradients.
6. Keep interfaces minimal and immersive.
7. Avoid visual noise.
8. Use motion subtly.
9. Prioritize atmosphere over density.
10. Design every screen like a product launch visual.

---

# Final Design Direction

The product should feel like:

> “A next-generation clean technology platform presented through cinematic sci-fi minimalism.”

The interface should feel:
- Expensive
- Intelligent
- Quiet
- Powerful
- Advanced
- Atmospheric
- Beautifully engineered
- Premium without being flashy