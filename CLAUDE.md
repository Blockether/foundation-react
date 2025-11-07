## Active Technologies
- TypeScript 5.x + React 18 + shadcn/ui, TailwindCSS, Lucide React, Vite (002-sql-cockpit)
- Browser-only (DuckDB-WASM, no server storage) (002-sql-cockpit)

### I. Browser-First Architecture
@blockether/foundation-react is exclusively a browser-based library. No Node.js server-side support will be implemented. All components and utilities MUST be designed and tested for browser environments only, using browser APIs and React patterns optimized for client-side rendering.

### II. shadcn/ui Foundation
All UI components MUST be built on top of shadcn/ui and the latest TailwindCSS framework. This ensures consistency, accessibility, and modern design patterns. Components should extend and enhance shadcn/ui primitives while maintaining full compatibility with the shadcn/ui ecosystem and theming system.

### III. ESM-Only Distribution
The library MUST expose a single ESM (ES Module) file as its primary distribution format. This aligns with modern JavaScript ecosystem standards and ensures optimal tree-shaking. The build process MUST generate a single, optimized ESM bundle with all necessary type definitions.

### IV. Design System Customizability
The library MUST be fully customizable through TailwindCSS theming. All components should support Tailwind's CSS customization patterns, allowing consumers to modify colors, spacing, typography, and other design tokens. The library should feel like a natural extension of TailwindCSS itself.

### V. Lucide React Icons Only
All icons MUST use Lucide React exclusively. No emoji, emoticons, or other icon libraries are permitted. Lucide React provides consistent, accessible, and customizable icons that align with modern React design patterns and maintain visual coherence across the library.

### VI. Python Library Integration
The library serves as the UI layer for agno and blockether_foundation Python libraries. Components MUST be designed to complement and enhance these backend libraries, focusing on chat interfaces, data visualization, and interactive elements that seamlessly integrate with Python-based data processing and analysis capabilities.

## Technology Standards

### Frontend Stack Requirements
- React 18+ with TypeScript for type safety
- TailwindCSS (latest version) for styling
- shadcn/ui for component primitives
- Vite for build tooling and development
- Vitest/Jest for testing with React Testing Library

### Build and Distribution
- Single ESM bundle output
- TypeScript declarations (.d.ts)
- CSS bundle exported as separate entry point
- Browser compatibility targeting modern browsers (ES2020+)
- No server-side build targets or Node.js compatibility

## Development Workflow

### Component Development
- All components MUST be developed as TypeScript React components
- Components must include comprehensive JSDoc documentation
- Each component must have corresponding stories in Storybook
- Unit tests are mandatory for all component logic
- Components must be accessible and follow WCAG guidelines
- **NEVER create example files** (e.g., `*-example.tsx`, `*-demo.tsx`, `*-sandbox.tsx`)
- All components should be production-ready and self-documenting through proper TypeScript types and JSDoc comments
- Integration examples should be documented in README files or component JSDoc, not as separate example files
- NEVER expose the internal libraries in the index.ts

### Code Quality Standards
- ESLint and Prettier configuration enforcement
- TypeScript strict mode enabled
- No console.log statements in production builds
- All dependencies must be audited for security vulnerabilities
- Components must handle loading and error states gracefully

## Governance

This constitution supersedes all other project documentation and practices. All code changes, reviews, and architectural decisions MUST comply with these principles. Any deviation requires explicit discussion and constitution amendment.

### Amendment Process
- Amendments require documentation of the change rationale
- Changes must be approved through project maintainers
- Version updates must follow semantic versioning principles
- All templates and documentation must be updated to reflect amendments
- Breaking changes require major version increment and migration guide

### Compliance Review
- All pull requests must verify constitution compliance
- Component reviews must check shadcn/ui integration
- Build process validation for ESM output requirements
- Regular audits for prohibited dependencies (Node.js-specific packages)
- Icon usage verification for Lucide React compliance