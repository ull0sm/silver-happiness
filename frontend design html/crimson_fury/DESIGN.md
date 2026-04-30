---
name: Crimson Fury
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#b08781'
  outline-variant: '#5f3f3a'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690000'
  primary-container: '#e60000'
  on-primary-container: '#fff7f5'
  inverse-primary: '#c00000'
  secondary: '#ffb5a0'
  on-secondary: '#601400'
  secondary-container: '#ff5625'
  on-secondary-container: '#541100'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#717272'
  on-tertiary-container: '#f8f8f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#872000'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Lexend
    fontSize: 80px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  base-unit: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered to evoke the raw adrenaline and peak physiological stress of high-intensity interval training (HIIT) and powerlifting. It targets athletes who view fitness as a battle, demanding a UI that feels as industrial and unyielding as a weight room floor. 

The aesthetic is a fusion of **High-Contrast Bold** and **Brutalism**. It avoids the softness of modern consumer apps in favor of a "no-nonsense" visual language. Every element is designed to feel heavy, fast, and high-impact, utilizing high-density layouts and aggressive visual cues to motivate users toward their next personal record.

## Colors

This design system operates exclusively in a dark mode environment to minimize visual fatigue and maximize the vibrance of accent colors. The foundation is built on **Pure Black** for depth and **Charcoal Grey** for structural layering.

The accent palette is "high-heat." **Crimson Red** serves as the primary action color, signifying power and urgency. **Orange-Red** is used for secondary highlights and "warning" states, such as heart rate zones or timers. Text is kept at pure white or high-brightness grey to ensure maximum legibility against the dark void of the background.

## Typography

The typography utilizes **Lexend** for its athletic, geometric clarity. To achieve a sense of speed and forward momentum, all headlines and labels must be **italicized**. 

Headlines use "Black" or "ExtraBold" weights with tight letter spacing and reduced line height to create a wall of text that feels imposing. Display sizes should be used aggressively to dwarf other UI elements. Body text remains upright and standard-weight to maintain readability, while utility labels are always uppercase and italicized to resemble the markings found on heavy machinery or athletic gear.

## Layout & Spacing

The layout follows a **fixed grid** model with a 12-column structure for desktop and a 4-column structure for mobile. The spacing rhythm is strictly based on an 8px base unit.

Negative space is used strategically—not to provide "breathing room," but to create tension. Elements are often grouped tightly in "stacks" to imply density and strength. Large, oversized margins are used only to separate major content sections, creating a cinematic, high-impact scroll experience.

## Elevation & Depth

In this design system, depth is not conveyed through shadows, but through **Tonal Layering** and **Bold Borders**. 

1. **Surface Tiers:** Pure black (#000000) is the lowest level. Charcoal (#1A1A1A) represents raised surfaces like cards or containers.
2. **Hard Outlines:** Instead of ambient shadows, use 2px solid borders in Charcoal or Primary Crimson to define boundaries. 
3. **Inner Glows:** For active states or high-intensity metrics (like an active timer), use a subtle inner crimson glow to make the element appear as if it is "heating up."

## Shapes

The shape language is strictly **Sharp (0px)**. Rounded corners are intentionally avoided to maintain a raw, industrial feel. 

Rectangular forms dominate the UI, echoing the shape of weight plates, benches, and shipping containers. This geometric rigidity reinforces the brand's focus on discipline and structure. When a "circular" element is required (such as a progress ring), it should be rendered with a thick stroke and no soft edges.

## Components

### Buttons
Primary buttons are solid Crimson Red with Black, Heavy Italicized text. They have 0px corner radius and no gradients. Secondary buttons use a 2px Crimson border with transparent backgrounds. On hover, buttons should "flash" to Orange-Red.

### Cards
Cards are Charcoal Grey (#1A1A1A) with a 2px Pure Black border. For featured workouts, the card may feature a top-border accent in Crimson.

### Inputs
Text fields are Black with a bottom-only 2px border in Charcoal. Upon focus, the border transforms into a Crimson-to-Orange gradient, and the label shifts to an uppercase, italicized "active" state.

### Chips & Tags
Used for muscle groups (e.g., "CHEST", "LEGS"). These are small, sharp-edged blocks with a Crimson background and Black text.

### Progress Bars
Progress is tracked using segmented bars rather than smooth fills, creating a mechanical, "loading" aesthetic. Use Orange-Red for the active fill to suggest heat and effort.

### Additional Components: The "Intensity Gauge"
A custom component for this design system, using a vertical or semi-circular bar with sharp segments that light up from Crimson to Orange-Red as the user's heart rate or weight volume increases.