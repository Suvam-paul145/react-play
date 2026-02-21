# 🔍 Top 20 Hard & Medium Level Issues for PR Contributions

> **Repository:** react-play — A collection of 110+ interactive ReactJS projects for learning.
>
> These issues were identified by analyzing the codebase for architectural gaps, security vulnerabilities,
> performance bottlenecks, code quality problems, and missing infrastructure. Each issue includes affected
> files, severity, and a clear description of what needs to be fixed.

---

## 🔴 Hard Level Issues

### 1. Implement Route-Based Code Splitting with React.lazy for All Plays

**Severity:** High | **Category:** Performance  
**Affected Files:**

- `src/plays/index.js` (auto-generated — imports all plays statically)
- `src/common/playlists/PlayList.jsx` (loads plays via `import * as all_plays from 'plays'`)
- `src/common/routing/RouteDefs.jsx`

**Description:**  
All 110+ plays are imported statically into a single bundle via `import * as all_plays from 'plays'` in `PlayList.jsx`. This means every play (including heavy dependencies like TensorFlow.js, Leaflet, CodeMirror, and P5.js) is loaded regardless of which play the user visits. The auto-generated `src/plays/index.js` re-exports every play component eagerly.

**What needs to be done:**

- Modify the play registration system to use `React.lazy()` and dynamic `import()` for each play
- Wrap play rendering in `<Suspense>` with appropriate loading fallbacks
- Update or replace the auto-generated `src/plays/index.js` to export lazy-loaded factories
- Verify that Webpack (via react-scripts) produces proper code-split chunks
- Add error boundaries per lazy-loaded play to handle chunk load failures

---

### 2. Fix XSS Vulnerabilities in dangerouslySetInnerHTML Usage

**Severity:** Critical | **Category:** Security  
**Affected Files:**

- `src/plays/markdown-editor/Output.jsx:7` — renders user-generated markdown without sanitization
- `src/plays/fun-quiz/QuizScreen.jsx:152,160` — renders quiz content unsanitized
- `src/plays/fun-quiz/EndScreen.jsx:18,23,28` — renders end screen content unsanitized
- `src/plays/text-to-speech/TextToSpeech.jsx:163` — renders user text unsanitized
- `src/plays/devblog/Pages/Article.jsx:53` — renders article content unsanitized
- `src/common/badges-dashboard/BadgeDetails.jsx:12` — renders badge HTML unsanitized
- `src/common/Testimonial/TestimonialCard.jsx:59` — renders testimonial unsanitized
- `src/plays/Selection-Sort-Visualizer/SelectionSortVisualizer.js:26` — direct `.innerHTML` DOM manipulation

**Description:**  
Multiple components use `dangerouslySetInnerHTML` or direct `.innerHTML` assignment to render content without sanitization. The project already has `dompurify` as a dependency but it's not used in these files. This creates cross-site scripting (XSS) attack vectors where malicious scripts could be injected.

**What needs to be done:**

- Wrap all `dangerouslySetInnerHTML` content with `DOMPurify.sanitize()` before rendering
- Replace direct `.innerHTML` assignments with React-safe alternatives or sanitized content
- Add ESLint rule `react/no-danger` as a warning to catch future occurrences
- Create a shared utility function (e.g., `sanitizeHTML()`) in `src/common/utils/` for consistency

---

### 3. Add Comprehensive Unit Test Coverage for Common Utilities and Hooks

**Severity:** High | **Category:** Testing  
**Affected Files:**

- `src/common/hooks/useFetch.js` — no tests
- `src/common/hooks/useCacheResponse.ts` — no tests
- `src/common/hooks/useContributors.js` — no tests
- `src/common/hooks/useFeaturedPlays.js` — no tests
- `src/common/hooks/useGitHub.js` — no tests
- `src/common/hooks/useLikePlays.js` — no tests
- `src/common/hooks/useLocalStorage.js` — no tests
- `src/common/utils/commonUtils.js` — no tests
- `src/common/utils/formatCount.ts` — no tests
- `src/common/services/plays.js` — no tests
- `src/common/search/search-helper.js` — no tests

**Description:**  
The entire codebase has only **2 unit test files** (both in `src/plays/savings-calculator/`). Critical infrastructure like custom hooks, utility functions, service layers, and the search/filter system have zero test coverage. The testing framework (Jest + React Testing Library) is properly configured but barely utilized.

**What needs to be done:**

- Write unit tests for all custom hooks using `@testing-library/react-hooks`
- Write unit tests for utility functions (`commonUtils.js`, `formatCount.ts`, `coverImageUtil.js`)
- Write tests for the search query parser (`search-helper.js` → `ParseQuery`, `QueryDBTranslator`)
- Write integration tests for service functions with mocked GraphQL responses
- Establish a test coverage threshold (e.g., 60% for `src/common/`) in CI

---

### 4. Implement Global Dark/Light Theme System Across All Styling Libraries

**Severity:** High | **Category:** Feature / Architecture  
**Affected Files:**

- `tailwind.config.js` — needs dark mode configuration
- `src/App.css` — global styles
- `src/common/header/Header.jsx` — needs theme toggle
- `src/common/footer/Footer.jsx` and `ExtendedFooter.jsx`
- `src/common/playlists/PlayCard.jsx`, `PlayList.jsx` — card components
- `src/common/home/` — all homepage sections
- 165+ CSS files and 30+ SCSS files across plays

**Description:**  
The application has no dark/light theme support. The codebase uses a mix of Tailwind CSS, plain CSS, SCSS, Material-UI (MUI), Emotion, and styled-components. Implementing a consistent theme system requires coordination across all these styling approaches without breaking the 110+ existing plays.

**What needs to be done:**

- Create a `ThemeContext` provider with `useTheme` hook and localStorage persistence
- Configure Tailwind's `darkMode: 'class'` strategy in `tailwind.config.js`
- Define CSS custom properties (variables) for all theme colors on `:root` and `.dark`
- Configure MUI's `ThemeProvider` with light/dark palette variants
- Add a theme toggle button in the Header component
- Update shared component styles to use CSS variables instead of hardcoded colors
- Provide a guide for play authors to adopt the theme system

---

### 5. Fix Memory Leaks from Uncleaned setInterval/setTimeout and Event Listeners

**Severity:** High | **Category:** Bug / Performance  
**Affected Files (setInterval/setTimeout without cleanup):**

- `src/common/404/PageNotFound.jsx:12`
- `src/plays/date-time-counter/hooks/useCountDown.js:9`
- `src/plays/typing-speed-test/components/TypingTest.jsx:89`
- `src/plays/clock/CurrentTimer.jsx:11`
- `src/plays/analog-clock/AnalogClock.jsx:11`
- `src/plays/codenchill/features/Timer/TimerContainer.jsx:68`

**Affected Files (addEventListener without removeEventListener):**

- `src/plays/image-gallery-using-unsplash-api/ImageGalleryUsingUnsplashApi.jsx` — scroll listener
- `src/plays/2048/Game2048Components/Grid.jsx` — keydown listener
- `src/plays/codenchill/features/DisplayTrackControls/TrackControls.jsx` — multiple keydown listeners
- `src/plays/typing-speed-test/components/TypingTest.jsx` — keydown listener
- `src/plays/simple-calculator/components/Buttons.jsx` — keydown listener

**Description:**  
Multiple plays create `setInterval`/`setTimeout` timers and add DOM event listeners inside `useEffect` hooks without returning cleanup functions. When users navigate away from these plays, the intervals/listeners continue running, causing memory leaks, stale state updates, and potential "setState on unmounted component" warnings.

**What needs to be done:**

- Add proper `useEffect` cleanup (return function) for every `setInterval`/`setTimeout`
- Add `removeEventListener` in cleanup for every `addEventListener`
- Use `AbortController` for fetch calls that should be cancelled on unmount
- Add an ESLint plugin or custom rule to detect missing cleanup patterns

---

### 6. Migrate All JavaScript Files to TypeScript with Strict Type Checking

**Severity:** High | **Category:** Code Quality / DX  
**Affected Files:**

- 135+ `.js` files and 70+ `.jsx` files need TypeScript conversion
- `tsconfig.json` — needs `strict: true` and additional compiler options
- 45+ instances of `any` type in existing `.ts`/`.tsx` files
- `src/common/hooks/useCacheResponse.ts:2` — cache typed as `any`
- `src/plays/wordle/Wordle.tsx:32` — `props: any`
- `src/plays/expenses-tracker/components/modal.tsx:5-11` — multiple `any` types
- `src/plays/shopping-cart/ShoppingCart.tsx:7` — `props: any`

**Description:**  
The codebase is a mixed JavaScript/TypeScript project with no migration strategy. About 60% of files remain in JavaScript, and existing TypeScript files frequently use `any` to bypass type safety. The `tsconfig.json` has `allowJs: true` but doesn't enable strict mode. PropTypes are disabled in ESLint, leaving component APIs unvalidated.

**What needs to be done:**

- Enable `strict: true` in `tsconfig.json` incrementally (start with `noImplicitAny`)
- Create shared type definitions for play metadata, user data, and API responses
- Convert `src/common/` services, hooks, and utilities to TypeScript first
- Replace all `any` types with proper interfaces and type annotations
- Add proper prop interfaces for all shared components
- Document TypeScript conventions for new play contributions

---

### 7. Implement Accessibility (a11y) Compliance Across the Platform

**Severity:** High | **Category:** Accessibility  
**Affected Files:**

- `.eslintrc.js` — missing `eslint-plugin-jsx-a11y`
- `src/common/header/Header.jsx` — navigation needs ARIA landmarks
- `src/common/search/SearchPlays.jsx` — search input needs ARIA labels
- `src/common/search/FilterPlays.jsx` — filter controls need ARIA
- `src/common/playlists/PlayCard.jsx` — cards need keyboard navigation
- `src/common/modal/index.jsx` — modal needs focus trap and ARIA attributes
- All interactive plays (games, calculators, etc.) need keyboard support

**Description:**  
The application has no systematic accessibility implementation. There are no ARIA attributes on navigation, search, modals, or interactive elements. ESLint configuration lacks the `jsx-a11y` plugin. Interactive plays (games, editors, calculators) don't support keyboard-only navigation. The modal component lacks focus trapping.

**What needs to be done:**

- Install and configure `eslint-plugin-jsx-a11y` with recommended rules
- Add ARIA landmarks (`role`, `aria-label`) to header, navigation, main, and footer
- Implement focus trap in modal components
- Add keyboard navigation to `PlayCard` list (arrow keys, Enter to select)
- Ensure all images have meaningful `alt` text
- Add skip-to-content link for keyboard users
- Ensure color contrast meets WCAG 2.1 AA standards
- Add ARIA live regions for dynamic content updates (search results, loading states)

---

### 8. Standardize Custom Hook Return Signatures and Error Handling

**Severity:** Medium-High | **Category:** Architecture / DX  
**Affected Files:**

- `src/common/hooks/useFetch.js` — returns `{data, loading, error}`
- `src/common/hooks/useContributors.js` — returns `{data, error, isLoading}`
- `src/common/hooks/useFeaturedPlays.js` — returns `[loading, error, data]` (array)
- `src/common/hooks/useGitHub.js` — returns `{data, error, isLoading}`
- `src/common/hooks/useLikePlays.js` — returns `{likePlay, unLikePlay}`
- `src/common/hooks/useFetchFilterData.js` — returns `[loading, error, data]` (array)

**Description:**  
Custom hooks use inconsistent return value patterns. Some return objects with different property names (`loading` vs `isLoading`), others return arrays with inconsistent ordering. Error handling varies from silent catch-and-return-empty to throwing. There is no standard retry logic or loading state management.

**What needs to be done:**

- Define a standard hook return type: `{ data, isLoading, error, refetch }`
- Refactor all hooks to follow the standard pattern
- Add consistent error handling with user-friendly error messages
- Implement retry logic for transient failures
- Add TypeScript interfaces for all hook return values
- Create a `useAsyncOperation` base hook that others can extend

---

### 9. Implement Proper Cache Strategy with TTL and Invalidation

**Severity:** Medium-High | **Category:** Performance / Architecture  
**Affected Files:**

- `src/common/hooks/useCacheResponse.ts` — global cache object without TTL or eviction
- `src/common/hooks/useFeaturedPlays.js` — uses cache with key `FILTER_DATA_RESPONSE`
- `src/common/hooks/useFetchFilterData.js` — shares cache key collision risk
- `src/common/services/plays.js` — no caching for repeated API calls
- `src/common/services/tags.js` — fetches tags without caching

**Description:**  
The current caching system (`useCacheResponse`) uses a global JavaScript object that persists for the lifetime of the page session. It has no TTL (time-to-live), no eviction policy, no size limits, and risks memory leaks. Cache keys could collide between different data types. There's no cache invalidation when data is mutated (e.g., after liking a play or creating a new one).

**What needs to be done:**

- Replace the global cache object with a proper caching solution (React Query, SWR, or custom with TTL)
- Add cache invalidation on mutations (create/update/delete operations)
- Implement stale-while-revalidate pattern for frequently accessed data
- Add cache size limits and LRU eviction
- Namespace cache keys to prevent collisions
- Add cache persistence to sessionStorage for page reload resilience

---

### 10. Fix Typo Bug and Missing Dependencies in Route and Hook Definitions

**Severity:** High | **Category:** Bug  
**Affected Files:**

- `src/common/routing/RouteDefs.jsx:56` — typo: `idex` should be `index`
- `src/common/hooks/useLocationChange.js:7` — missing `action` in useEffect dependency array
- `src/common/search/SearchPlays.jsx:16` — `location` used but potentially not imported

**Description:**  
There are critical bugs in core infrastructure files:

1. In `RouteDefs.jsx`, the attribute `idex` is a typo of `index`, which could affect route matching behavior for nested routes.
2. In `useLocationChange.js`, the `action` callback is called inside `useEffect` but not included in the dependency array, meaning the effect could reference a stale closure.
3. In `SearchPlays.jsx`, `location` is referenced but may not be properly imported from react-router-dom.

**What needs to be done:**

- Fix `idex` → `index` in `RouteDefs.jsx`
- Add `action` to the dependency array in `useLocationChange.js`
- Verify and fix the `location` import in `SearchPlays.jsx`
- Add regression tests for each fix

---

## 🟠 Medium Level Issues

### 11. Add AbortController to All Fetch/Axios API Calls

**Severity:** Medium | **Category:** Performance / Reliability  
**Affected Files:**

- 77+ files using `fetch` or `axios` across `src/plays/` and `src/common/`
- `src/common/hooks/useFetch.js` — no AbortController
- `src/common/hooks/useContributors.js` — no request cancellation
- `src/common/hooks/useGitHub.js` — no request cancellation
- `src/plays/weather/components/CityInput.jsx` — API call without cancellation
- `src/plays/github-user-finder/` — multiple API calls without cancellation
- `src/plays/news-feed-application/` — news fetching without cancellation

**Description:**  
API calls made in `useEffect` hooks don't use `AbortController` to cancel in-flight requests when the component unmounts or when new requests are made. This causes race conditions, memory leaks, and "setState on unmounted component" warnings.

**What needs to be done:**

- Add `AbortController` to `useFetch` hook with signal passing and cleanup
- Implement request cancellation in `useContributors` and `useGitHub` hooks
- Update Axios calls to use `cancelToken` or `signal` option
- Cancel previous requests when search/filter inputs change rapidly

---

### 12. Replace Inline Styles with CSS Modules or Tailwind Utilities

**Severity:** Medium | **Category:** Code Quality / Maintainability  
**Affected Files (40+ instances):**

- `src/plays/dad-jokes/components/singleJoke/SingleJoke.jsx:51`
- `src/plays/analog-clock/AnalogClock.jsx:32,38,44`
- `src/plays/typing-speed-test/components/Statistics.jsx:8-32`
- `src/plays/social-card/CardDetails.jsx:106,128`
- `src/plays/personal-profile-card/` — multiple files
- `src/plays/emoji-game/` — multiple files
- `src/plays/digital-delight/` — multiple files

**Description:**  
Many play components use inline `style={{...}}` objects instead of CSS classes. This bypasses the project's Tailwind and CSS/SCSS setup, makes theming impossible, causes unnecessary re-renders (new object references on each render), and makes the codebase inconsistent.

**What needs to be done:**

- Replace inline styles with Tailwind utility classes or CSS module classes
- Extract dynamic styles (those based on state/props) into CSS variables
- Create a linting rule or guideline discouraging inline styles in new plays
- Document the preferred styling approach in CONTRIBUTING.md

---

### 13. Add Error Boundaries Per Play to Prevent Full App Crashes

**Severity:** Medium | **Category:** Reliability  
**Affected Files:**

- `src/ErrorBoundary/ErrorBoundary.jsx` — only wraps the entire app
- `src/common/playlists/PlayMeta.jsx` — renders individual plays without error boundary
- `src/common/routing/RouteDefs.jsx` — no per-route error boundaries

**Description:**  
The app has a single `ErrorBoundary` at the root level. If any individual play throws a runtime error, the entire application crashes to the error fallback. Plays are community-contributed and may contain bugs that shouldn't affect the rest of the application.

**What needs to be done:**

- Create a `PlayErrorBoundary` component that wraps individual play rendering
- Show a play-specific error message with a "return to plays list" option
- Add error reporting/logging for play crashes
- Integrate the boundary in `PlayMeta.jsx` where plays are dynamically rendered
- Ensure the error boundary resets when navigating to a different play

---

### 14. Optimize Image Assets and Implement Lazy Loading for Play Thumbnails

**Severity:** Medium | **Category:** Performance  
**Affected Files:**

- 310+ image files in `src/` (PNG, JPG, SVG)
- `src/plays/*/cover.png` — play thumbnail images (one per play)
- `src/common/playlists/PlayThumbnail.jsx` — renders thumbnails eagerly
- `src/common/utils/coverImageUtil.js` — dynamic image loading
- `src/service-worker.js` — image caching strategy (StaleWhileRevalidate, max 50)

**Description:**  
Play thumbnail images (`cover.png`) are loaded eagerly for all visible plays. With 110+ plays in the list, this creates a large number of concurrent image requests. There is no image optimization pipeline (compression, WebP conversion, responsive sizes). The service worker caches only 50 images, so navigation generates repeated network requests.

**What needs to be done:**

- Implement native lazy loading (`loading="lazy"`) for play thumbnail images
- Add `IntersectionObserver`-based lazy loading as a fallback
- Set up image optimization in the build pipeline (WebP conversion, compression)
- Increase service worker cache limit or implement smarter eviction
- Use responsive images with `srcSet` for different viewport sizes
- Add placeholder/skeleton loading states while images load

---

### 15. Fix Hardcoded Values and Magic Numbers Throughout the Codebase

**Severity:** Medium | **Category:** Code Quality / Maintainability  
**Affected Files:**

- `src/common/header/Header.jsx:100` — hardcoded event countdown date `new Date(1675209600000)`
- `src/common/search/SearchPlays.jsx:37` — magic debounce delay `500`ms
- `src/common/hooks/useCacheResponse.ts` — hardcoded cache key strings
- `src/common/services/plays.js` — hardcoded query limits and offsets
- Various plays with hardcoded API URLs, color values, and numeric constants

**Description:**  
The codebase contains hardcoded dates, magic numbers, and string literals scattered across files. The countdown timer in the header points to a past event date. Debounce delays, cache keys, and API parameters are not extracted to constants, making the code harder to maintain and configure.

**What needs to be done:**

- Extract all magic numbers to named constants in `src/constants/`
- Move configuration values (debounce delay, cache TTL, API limits) to a config file
- Remove or make conditional the expired countdown timer
- Create an environment-variable-driven configuration for feature flags
- Document all constants with JSDoc comments explaining their purpose

---

### 16. Implement Consistent Loading and Error States Across All Components

**Severity:** Medium | **Category:** UX / Architecture  
**Affected Files:**

- `src/common/spinner/` — existing spinner component
- `src/common/playlists/PlayList.jsx` — loading state handling
- `src/common/playleaderboard/LeaderBoard.jsx` — loading state handling
- `src/common/home/HomePlays.jsx` — loading state handling
- Various plays with inconsistent loading/error patterns

**Description:**  
Loading and error states are handled inconsistently across the application. Some components show a spinner, others show nothing, and some show different error messages or silently fail. There's no standardized loading skeleton, error display, or retry mechanism.

**What needs to be done:**

- Create reusable `<LoadingState />` and `<ErrorState />` components
- Implement skeleton loading screens for card lists and data tables
- Add a standardized error display with retry button
- Create a `<AsyncContent />` wrapper component that handles loading/error/empty states
- Document the pattern for play authors in CONTRIBUTING.md

---

### 17. Resolve TODO/FIXME Items and Remove Temporary Code

**Severity:** Medium | **Category:** Code Quality / Tech Debt  
**Affected Files:**

- `src/common/playideas/PlayIdeas.jsx:17` — `TODO: The idea list has to come from the DB`
- `src/common/badges-dashboard/index.jsx:55` — `TODO: Bridge fix`
- `src/common/createplay/CreatePlay.jsx:133` — `TODO: Remove this temporary code`
- `src/common/activities/activitiesConfig.js:4` — `HACK-R-PLAY 2.0` reference

**Description:**  
There are unresolved TODO comments indicating incomplete features and temporary code that was never cleaned up. The play ideas feature is hardcoded instead of fetched from the database. The create play form contains temporary code that should have been removed. These items indicate technical debt that could cause maintenance issues.

**What needs to be done:**

- Implement database-backed play ideas list as indicated by the TODO
- Fix the badges dashboard bridge issue
- Remove the temporary code in CreatePlay component
- Audit all TODO/FIXME/HACK comments and create individual issues for each
- Add a CI check that flags new TODO comments without linked issue numbers

---

### 18. Standardize File and Folder Naming Conventions

**Severity:** Medium | **Category:** Code Quality / DX  
**Affected Files:**

- Play folders: mix of `kebab-case` (`analog-clock`, `text-avatar`) — this is the majority
- Component files: mix of `PascalCase` (`PlayHeader.jsx`, `ErrorBoundary.jsx`) and `camelCase` (`commonUtils.js`)
- Style files: mix of `kebab-case` (`play-card.css`) and `camelCase` (`leaderBoard.css`)
- Some folders: `kebab-case` (`badges-dashboard`) vs `camelCase` (`playideas`)
- Common folder names: `createplay` (no separator) vs `badges-dashboard` (kebab-case)

**Description:**  
The project uses inconsistent naming conventions for files, folders, and components. Play folders use kebab-case, component files use PascalCase, utility files use camelCase, and common folders mix between no-separator and kebab-case. This makes it harder for contributors to know which convention to follow.

**What needs to be done:**

- Define a clear naming convention: kebab-case for folders, PascalCase for components, camelCase for utilities
- Rename inconsistent folders in `src/common/` (e.g., `playideas` → `play-ideas`, `playleaderboard` → `play-leaderboard`)
- Update all imports after renaming
- Document the naming convention in CONTRIBUTING.md
- Add a lint rule to enforce file naming patterns

---

### 19. Add E2E Test Coverage for Play CRUD and Search/Filter Workflows

**Severity:** Medium | **Category:** Testing  
**Affected Files:**

- `e2e/tests/` — currently has 4 test specs (homepage, plays, ideas, testimonials)
- `e2e/pageobjects/` — page object models for existing tests
- Missing: play interaction tests, search/filter tests, navigation tests

**Description:**  
E2E tests cover only basic page rendering (homepage sections, plays list, ideas, testimonials). There are no tests for critical user workflows like searching for plays, applying filters, navigating to a play and interacting with it, or the play creation flow. The play detail page (`PlayMeta`) has zero E2E coverage.

**What needs to be done:**

- Add E2E tests for the search workflow (typing search term, verifying filtered results)
- Add E2E tests for filter interactions (level, language, tags dropdowns)
- Add E2E tests for play detail page navigation and rendering
- Add E2E tests for the leaderboard page
- Add E2E tests for responsive layout (mobile viewport)
- Create Page Object Models for new test pages
- Ensure CI runs E2E tests on pull requests

---

### 20. Implement Proper GraphQL Query Typing and Error Handling in Services

**Severity:** Medium | **Category:** Architecture / Reliability  
**Affected Files:**

- `src/common/services/request/` — `submit()` and `submitMutation()` functions
- `src/common/services/plays.js` — play CRUD queries with inline strings
- `src/common/services/tags.js` — tag queries
- `src/common/services/badges.js` — badge queries (silent error catch returning empty arrays)
- `src/common/services/levels.js` — level queries
- `src/common/services/issues.js` — GitHub API integration

**Description:**  
GraphQL queries are written as inline template strings without type definitions, validation, or IDE support. The `badges.js` service silently catches errors and returns empty arrays, hiding failures from users. There's no centralized error handling, retry logic, or request deduplication across the service layer.

**What needs to be done:**

- Define GraphQL operations in `.graphql` files with proper typing
- Add TypeScript types for all query responses and mutation inputs
- Implement centralized error handling with user-friendly error messages
- Add retry logic for transient network failures (exponential backoff)
- Remove silent error catching in `badges.js` — surface errors to the UI
- Add request deduplication to prevent redundant identical queries
- Consider using a GraphQL client library (Apollo, urql) for built-in caching and type generation

---

## 📊 Summary Table

| # | Issue | Level | Category | Impact |
|---|-------|-------|----------|--------|
| 1 | Code Splitting for Plays | 🔴 Hard | Performance | Bundle size, load time |
| 2 | XSS in dangerouslySetInnerHTML | 🔴 Hard | Security | User data safety |
| 3 | Unit Test Coverage | 🔴 Hard | Testing | Code reliability |
| 4 | Dark/Light Theme System | 🔴 Hard | Feature | User experience |
| 5 | Memory Leaks (Timers/Listeners) | 🔴 Hard | Bug | App stability |
| 6 | TypeScript Migration | 🔴 Hard | Code Quality | Developer experience |
| 7 | Accessibility Compliance | 🔴 Hard | Accessibility | Inclusivity |
| 8 | Standardize Hook Patterns | 🔴 Hard | Architecture | Consistency |
| 9 | Cache Strategy with TTL | 🔴 Hard | Performance | Data freshness |
| 10 | Fix Route/Hook Bugs | 🔴 Hard | Bug | Core functionality |
| 11 | AbortController for API Calls | 🟠 Medium | Performance | Memory leaks |
| 12 | Replace Inline Styles | 🟠 Medium | Code Quality | Maintainability |
| 13 | Per-Play Error Boundaries | 🟠 Medium | Reliability | App stability |
| 14 | Image Optimization & Lazy Load | 🟠 Medium | Performance | Page speed |
| 15 | Remove Hardcoded Values | 🟠 Medium | Code Quality | Maintainability |
| 16 | Consistent Loading/Error States | 🟠 Medium | UX | User experience |
| 17 | Resolve TODOs & Temp Code | 🟠 Medium | Tech Debt | Code cleanliness |
| 18 | Naming Convention Standardization | 🟠 Medium | Code Quality | Contributor DX |
| 19 | E2E Test Coverage Expansion | 🟠 Medium | Testing | Regression safety |
| 20 | GraphQL Typing & Error Handling | 🟠 Medium | Architecture | Reliability |

---

## 🚀 Getting Started

To contribute a fix for any of these issues:

1. Fork the repository and create a branch: `git checkout -b fix/issue-description`
2. Follow the [Contributing Guidelines](./CONTRIBUTING.md)
3. Use commit format: `type(scope): description` (e.g., `fix(common/hooks): add cleanup to useFetch`)
4. Test your changes locally with `npm run lint` and `npm run test`
5. Submit a PR referencing this issue document

> **Tip:** Issues #2 (XSS), #5 (Memory Leaks), and #10 (Typo Bugs) are good starting points as they have clearly defined, localized fixes with high impact.
