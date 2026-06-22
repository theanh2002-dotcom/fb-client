# React + Tailwind CSS Best Practices & Architecture (2024/2026)

## 1. Core Architectural Philosophy
*   **Feature-First (Feature-Driven Architecture):** Instead of grouping by file type (`/components`, `/hooks`), group by domain/feature (`/features/auth`, `/features/dashboard`). Each feature folder should contain its own components, hooks, api, and types.
*   **Colocation:** Keep styles, tests, and logic as close to the component as possible.
*   **Global Cleanup:** Keep the `src/` root clean. Use global directories (`src/components`, `src/hooks`) only for true primitives (e.g., generic Buttons, global auth hooks).

## 2. Recommended Folder Structure
```text
src/
├── app/              # Router, global providers, and entry points
├── assets/           # Global static assets (fonts, icons, images)
├── components/       # Truly shared, generic UI components (Button, Input)
├── features/         # Feature-based modules (Domain logic)
│   ├── auth/
│   │   ├── api/      # Feature-specific API calls
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts  # Public API for the feature
│   └── dashboard/
├── hooks/            # Global/shared hooks
├── utils/            # Helper functions
└── styles/           # CSS variables and Tailwind base imports
```

## 3. Tailwind CSS Best Practices
*   **Utility-First:** Use Tailwind classes directly in your JSX. Avoid creating separate CSS files for components unless absolutely necessary.
*   **CSS-Native Config (Tailwind v4+):** Configuration is moving to CSS. Use the `@theme` directive directly in your CSS files (like `index.css`) to define colors, fonts, and spacing instead of relying entirely on `tailwind.config.js`.
*   **Abstraction:** Do not abstract styles into custom classes (using `@apply`) until you have a repeated pattern with many variants. For complex variant management, use libraries like `cva` (Class Variance Authority) or `tailwind-merge` + `clsx`.
*   **Dynamic Class Names:** Avoid string concatenation for class names. Use `clsx` or `tailwind-merge` to combine classes conditionally to avoid conflicts.

## 4. UI/UX Guidelines
*   **Strict Design Adherence (Stitch):** UI must strictly adhere 100% to the provided design mockups on Stitch. Avoid inventing custom aesthetics (e.g., unauthorized glassmorphism or overly dynamic animations) unless they are explicitly present in the Stitch design.
*   **Design System First:** All colors, spacing, and theming must map exactly to the tokens and styles defined in the Stitch design system to maintain absolute consistency.
*   **Typography:** Use the exact fonts, weights, and line heights as specified in the Stitch mockups instead of relying on browser defaults.

## 5. SEO & Accessibility (a11y)
*   Ensure semantic HTML elements (`<main>`, `<nav>`, `<section>`, `<article>`) are used.
*   Include appropriate `aria-` attributes for interactive custom components.
*   Maintain a clear heading hierarchy (only one `<h1>` per page).
