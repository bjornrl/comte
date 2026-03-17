# UI/UX Design Rules

These rules apply to ALL visual and interaction work in this codebase.

---

## Spacing System (8pt Grid)

All spacing values are multiples of 8px. Use 4px only for fine-tuning within components.

**Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

**Rules:**
- Internal spacing (inside a component) must be LESS than or equal to external spacing (between components)
- Related items: 8-16px apart
- Loosely related: 24-32px apart
- Different sections: 48-64px apart
- Different content areas: 64-128px apart
- When in doubt, add more whitespace

---

## Responsive Design

**Breakpoints:** 640, 768, 1024, 1280px

**Mobile-first principles:**
- Mobile: single column, full-width elements, no hover-dependent interactions, touch targets 44x44px minimum
- Tablet (768px+): two columns where appropriate
- Desktop (1024px+): multi-column layouts, hover states active, higher information density

**Critical rules:**
- Body text: never smaller than 16px on mobile (prevents iOS zoom on input focus too)
- Use `clamp()` for responsive font sizes and spacing — e.g. `clamp(1rem, 2vw, 1.25rem)`
- Horizontal padding on containers: `clamp(1rem, 4vw, 2rem)`
- Grid layouts collapse to single column below 768px
- Images and media: `max-width: 100%` always
- Test at 375px (iPhone SE), 768px (iPad), 1024px (laptop), 1280px+ (desktop)

**Responsive typography:**
- Display/hero headings: use `clamp()` with a wide range — e.g. `clamp(2rem, 8vw, 6rem)`
- Section headings: `clamp(1.5rem, 3vw, 2.5rem)`
- Body text: `clamp(1rem, 1.5vw, 1.25rem)`
- Small/label text: `clamp(0.7rem, 1vw, 0.8rem)`

---

## Typography Rules

- Use a type scale based on a ratio (1.200 or 1.250 recommended), not random sizes
- Maximum 4 font sizes for most interfaces (6 absolute max)
- Line height: 1.4-1.6 for body, 1.1-1.3 for headings
- As text gets larger, letter-spacing gets tighter (-0.01 to -0.04em)
- ALL CAPS text always needs extra letter-spacing (+0.05 to +0.1em)
- Maximum 2-3 typefaces per project
- Weight variation creates hierarchy better than style variation
- Left-align text (centered text is harder to scan — use centered sparingly for hero moments only)

---

## Color Usage

**60-30-10 rule:**
- 60% dominant — background/canvas
- 30% secondary — surfaces, cards, secondary text
- 10% accent — interactive elements, CTAs

**Rules:**
- Never use pure #000000 or #FFFFFF — too harsh. Use near-black and off-white.
- Body text contrast: minimum 4.5:1 against its background (WCAG AA)
- Large text contrast: minimum 3:1 (WCAG AA)
- Never convey meaning through color alone — always pair with text, icons, or patterns
- Don't mix warm and cool grays in the same interface
- Subtle dividers: 1px, low opacity (10-20%) of the text color

---

## Animation & Motion

**Easing:**
- Enter/appear: ease-out — `cubic-bezier(0.25, 1, 0.5, 1)`
- Leave/disappear: ease-in — `cubic-bezier(0.55, 0, 1, 0.45)`
- Reposition: ease-in-out — `cubic-bezier(0.45, 0, 0.55, 1)`
- NEVER use linear easing except for progress bars

**Timing:**
- Micro-interactions (hover, toggle): 100-200ms
- Tooltips, small reveals: 150-250ms
- Panel expand/collapse: 300-500ms
- Page-level transitions: 500-800ms
- Staggered elements: 50-80ms between each
- Closing is always faster than opening

**Performance rules:**
- Animate ONLY `transform` and `opacity` — these are GPU-accelerated
- NEVER animate `width`, `height`, `top`, `left`, `padding`, `margin` — causes layout reflow
- Use `will-change: transform` on elements that will animate (sparingly)
- Respect `prefers-reduced-motion` — reduce or disable non-essential animations:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## Accessibility (Non-Negotiable)

- **Touch targets:** 44x44px minimum, 48px ideal
- **Color contrast:** 4.5:1 for text, 3:1 for large text (WCAG AA)
- **Keyboard navigation:** every interactive element reachable via Tab, logical tab order
- **Focus indicators:** visible focus ring on ALL interactive elements — never `outline: none` without a replacement
- **Semantic HTML:** use `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>` — not divs with click handlers
- **Heading hierarchy:** h1 → h2 → h3, never skip levels
- **Images:** meaningful images need `alt` text, decorative images get `alt=""`
- **aria-label:** required on icon-only buttons and links without visible text
- **Forms:** every input needs a visible, associated `<label>`
- **Color independence:** never use color alone to convey meaning — pair with text or icons
- **prefers-reduced-motion:** respect it
- **prefers-color-scheme:** respect it if dark mode is supported
- **Screen readers:** test that content makes sense when read linearly

---

## Component Patterns

**Buttons:**
- Min touch target: 44x44px
- Horizontal padding = 2× vertical padding
- Hover: subtle background change (not just color change)
- Active/pressed: slight scale(0.98) or darken
- Focus: visible focus ring
- Disabled: reduced opacity (0.5), `cursor: not-allowed`
- ONE primary button per screen section — supporting actions get secondary treatment

**Inputs:**
- Every input needs a visible label (NEVER placeholder-only)
- Label-to-input gap: 4-6px
- Between form fields: 16-24px
- Heights should match button heights in the same context
- Error messages: specific, helpful, placed directly below the input

**Cards:**
- Consistent padding across all cards in the same view
- Gap between cards > padding inside cards
- Single clear purpose per card

**Modals/overlays:**
- Backdrop: rgba(0,0,0,0.4) to rgba(0,0,0,0.6)
- Close button: always visible, top-right
- Escape key closes the modal
- Focus trapped inside modal while open
- Max width: 480px (forms), 640px (content), 960px (complex)

---

## Layout Principles

**Grid:** use a 12-column grid (divides evenly by 2, 3, 4, 6)

**Alignment:** align elements to a shared left edge wherever possible. Optical alignment sometimes matters more than mathematical alignment.

**Whitespace:** whitespace is active design, not empty space. More whitespace around an element = more importance. Prefer whitespace over visible dividers.

**Visual hierarchy:** users scan in 3 seconds. Design for the scan:
- Most important thing first
- One hero element per view — if everything is emphasized, nothing is
- Size, weight, contrast, and whitespace create hierarchy — not decoration

**Content width:** body text should never exceed ~70-75 characters per line for readability. Constrain with max-width on text containers (typically 640-900px).

---

## Edge Cases (Design These First, Not Last)

- **Empty states:** explain what will appear and provide the action to fill it
- **Loading states:** use skeleton screens (show structure) not spinners (show nothing)
- **Error states:** answer what happened, why, and what to do next
- **0 items, 1 item, 1000 items:** test all three
- **Long text:** names, titles, descriptions that overflow — handle with truncation or wrapping
- **Missing data:** what shows when an image fails to load or a field is empty?
- **Slow connections:** does it feel broken on 3G?

---

## Quality Checklist (Before Every PR)

- [ ] Spacing consistent and on the 8pt grid?
- [ ] Font sizes from a defined scale (not random)?
- [ ] Color contrast passes WCAG AA (4.5:1 body, 3:1 large)?
- [ ] Touch targets at least 44x44px?
- [ ] Works well at 375px mobile width?
- [ ] Body text never below 16px on mobile?
- [ ] Hover states on all interactive elements?
- [ ] Focus indicators visible on all interactive elements?
- [ ] Animations use transform/opacity only?
- [ ] `prefers-reduced-motion` respected?
- [ ] Internal spacing ≤ external spacing on all components?
- [ ] Empty/loading/error states designed?
- [ ] Semantic HTML used (not divs for everything)?
- [ ] Heading hierarchy logical (h1 → h2 → h3)?