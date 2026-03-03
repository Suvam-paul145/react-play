# Issue: Implement Comprehensive Accessibility (a11y) System

**Level:** Hard  
**Labels:** `accessibility`, `enhancement`, `good-hard-issue`  
**Estimated Effort:** Large

---

## Summary

React Play currently lacks several critical accessibility features required for WCAG 2.1 AA compliance. This issue covers implementing a comprehensive accessibility system including skip navigation, focus management on route changes, ARIA live regions for dynamic content updates, keyboard-navigable play card grids, enhanced focus-visible styles, and reduced-motion support. These changes will make the application usable for people who rely on keyboards, screen readers, and other assistive technologies.

---

## Problem

1. **No skip-to-content link:** Keyboard and screen reader users must tab through the entire header navigation on every page before reaching the main content.
2. **No focus management on route changes:** When navigating between pages via client-side routing, focus remains on the previously clicked element instead of moving to the new page content, leaving screen reader users disoriented.
3. **No ARIA live region for search results:** When the play list updates after a search or filter change, screen reader users receive no announcement about the number of results found.
4. **Play card grid is not keyboard-navigable:** The play cards in the grid lack proper `role`, `aria-label`, and keyboard interaction patterns. Users cannot efficiently navigate the grid using arrow keys.
5. **No custom focus-visible styles:** Interactive elements lack clearly visible focus indicators, making keyboard navigation difficult for sighted users.
6. **No reduced-motion support:** Animations and transitions do not respect the `prefers-reduced-motion` media query, which can cause discomfort for users with vestibular disorders.

---

## Proposed Solution

### 1. Skip-to-Content Link
- Add a visually hidden skip link as the first focusable element in the app.
- The link becomes visible on focus and jumps to the `<main>` content area.
- Styled to appear prominently at the top of the page when focused.

### 2. Focus Management on Route Changes (`useRouteAnnouncer` Hook)
- Create a custom React hook that listens for route changes via `react-router-dom`.
- On each route change, programmatically move focus to the main content area.
- Include an ARIA live region that announces the new page title to screen readers.

### 3. ARIA Live Region for Search Results
- Add an `aria-live="polite"` region in the play list that announces the number of search results.
- Use `role="status"` to ensure screen readers pick up dynamic content changes.
- Announce messages like "12 plays found" or "No plays found" after search/filter updates.

### 4. Keyboard-Navigable Play Card Grid
- Add `role="list"` to the play card container and `role="listitem"` to each card.
- Ensure each play card link has a descriptive `aria-label` (e.g., "View play: Todo App by John - Intermediate level").
- Add focus styles specific to play cards for clear visual feedback.

### 5. Focus-Visible Styles
- Add global `:focus-visible` styles for all interactive elements (buttons, links, inputs).
- Use a high-contrast outline that works on both light and dark backgrounds.
- Remove default browser outline only when `:focus-visible` is not matched.

### 6. Reduced-Motion Support
- Add `@media (prefers-reduced-motion: reduce)` rules.
- Disable or minimize all CSS transitions and animations when the user prefers reduced motion.
- Apply to both global styles and component-specific animations.

---

## Acceptance Criteria

- [ ] A skip-to-content link is present and becomes visible on keyboard focus
- [ ] Focus moves to main content area on every client-side route change
- [ ] Screen readers announce the current page title on route changes
- [ ] Screen readers announce the number of search results when the play list updates
- [ ] Play cards have proper ARIA attributes (`aria-label` with play name, creator, level)
- [ ] All interactive elements have visible focus indicators using `:focus-visible`
- [ ] CSS transitions/animations are disabled when `prefers-reduced-motion: reduce` is active
- [ ] All changes pass existing lint rules and tests
- [ ] No existing functionality is broken

---

## Technical Details

### Files to Modify
- `src/App.css` — Global focus-visible and reduced-motion styles
- `src/common/header/Header.jsx` — Skip-to-content link
- `src/App.jsx` — Main content landmark with `id` for skip link target
- `src/common/hooks/useRouteAnnouncer.js` — New custom hook for route change announcements
- `src/common/routing/RouteDefs.jsx` — Integrate route announcer
- `src/common/playlists/PlayList.jsx` — ARIA live region for search results
- `src/common/playlists/PlayCard.jsx` — ARIA labels on play cards

### Dependencies
- No new dependencies required. Uses native HTML/CSS and React features.

---

## References
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Skip Navigation Links](https://webaim.org/techniques/skipnav/)
