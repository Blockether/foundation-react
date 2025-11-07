# Implementation Plan: Blockether Foundation Cockpit Component

**Branch**: `001-foundation-cockpit` | **Date**: 2025-11-06 | **Spec**: [Blockether Foundation Cockpit Component](./spec.md)
**Input**: Feature specification from `/specs/001-foundation-cockpit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The CockpitsComposer component will serve as the foundational container component for the @blockether/foundation-react library. This minimal, responsive cockpit component will be built using shadcn/ui primitives, support full TailwindCSS theming, and include comprehensive Storybook documentation. The component will inherit width from parent containers and provide a clean foundation for embedding other library components.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18
**Primary Dependencies**: shadcn/ui, TailwindCSS, Lucide React, Vite
**Storage**: N/A (browser-only library)
**Testing**: Jest + React Testing Library + Storybook
**Target Platform**: Modern browsers (ES2020+) - Browser Only!
**Project Type**: UI component library (ESM distribution)
**Performance Goals**: Optimal bundle size, tree-shaking, runtime performance
**Constraints**: No Node.js support, single ESM output, shadcn/ui compatibility
**Scale/Scope**: Component library for Python backend integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Browser-only architecture (no Node.js dependencies)
- ✅ shadcn/ui foundation compliance
- ✅ ESM-only distribution requirement
- ✅ TailwindCSS theming support
- ✅ Lucide React icons only
- ✅ Python library integration focus

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-cockpit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # React components (TypeScript)
│   ├── ui/             # shadcn/ui based components
│   │   └── card.tsx   # shadcn/ui Card component (to be added)
│   ├── foundation/     # Foundation-specific components
│   │   └── blockether-foundation-cockpit.tsx  # Main component
│   ├── chat/           # Chat interface components (future)
│   └── data/           # Data visualization components (future)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
│   └── foundation.ts  # Component-specific types
└── index.ts            # Main entry point (ESM export)

stories/                # Storybook stories
├── foundation/
│   └── blockether-foundation-cockpit.stories.tsx  # Component stories
└── components/

tests/                  # Component tests
├── __mocks__/
├── unit/
│   └── foundation/
│       └── blockether-foundation-cockpit.test.tsx  # Component tests
└── integration/
```

**Structure Decision**: Component library structure optimized for ESM distribution and shadcn/ui integration

## Phase 0: Research & Setup

### shadcn/ui Integration Research

**Current State**: Project has Vite, React, TypeScript, and TailwindCSS configured, but shadcn/ui is not yet initialized.

**Required Setup**:
1. Initialize shadcn/ui configuration (`components.json`)
2. Add base shadcn/ui components (Card, etc.)
3. Configure shadcn/ui theming integration with existing TailwindCSS setup

**Dependencies Analysis**:
- ✅ React 18+ (present)
- ✅ TypeScript (present)
- ✅ TailwindCSS (present)
- ✅ Lucide React (present)
- ❌ shadcn/ui components (needs setup)

### Component Design Research

**shadcn/ui Component Selection**:
- Primary: `Card` component for container functionality
- Alternative: `div` with shadcn/ui styling utilities if Card is too feature-rich

**Responsive Behavior**:
- Use `w-full` class for full parent width inheritance
- Support parent container constraints via natural CSS flow
- No fixed breakpoints - let parent containers handle responsiveness

## Phase 1: Design & Architecture

### Component Interface Design

```typescript
export interface CockpitsComposerProps {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}
```

### Component Architecture

**Core Design Principles**:
1. **Minimalist**: Clean container with no unnecessary decoration
2. **Responsive**: Inherits parent width, handles overflow gracefully
3. **Theming**: Full TailwindCSS token support
4. **Accessibility**: Proper semantic HTML and ARIA attributes
5. **Composition**: Supports shadcn/ui asChild pattern

**shadcn/ui Integration Strategy**:
- Base component: shadcn/ui Card with minimal styling
- Override: Custom className support for TailwindCSS customization
- Forward refs: Support for ref forwarding (shadcn/ui pattern)

### Data Model

**Component State**: Stateless functional component
**Props Flow**: Single-direction data flow from parent
**Event Handling**: No custom events - container only

## Phase 2: Implementation Strategy

### Development Approach

1. **Setup First**: Configure shadcn/ui before component implementation
2. **Component Core**: Build basic container functionality
3. **Theming**: Ensure full TailwindCSS customization support
4. **Documentation**: Create comprehensive Storybook stories
5. **Testing**: Add unit and integration tests
6. **Export**: Update main library exports

### Quality Gates

- **TypeScript Strict Mode**: All code must pass strict type checking
- **ESLint Rules**: Zero warnings, proper React patterns
- **Bundle Size**: Component contribution < 2KB gzipped
- **Performance**: Render time < 16ms (60fps)
- **Accessibility**: WCAG 2.1 AA compliance

## Complexity Tracking

> **No constitution violations - all complexity is justified and minimal**

| Complexity Area | Justification | Simpler Alternative Rejected |
|-----------------|---------------|------------------------------|
| shadcn/ui setup | Required by constitution for consistency | Manual CSS would violate constitution principles |
| TypeScript strict mode | Required for type safety and library quality | JavaScript would violate constitution requirements |
| Storybook documentation | Essential for component adoption and user experience | No docs would reduce developer experience significantly |

## Constitution Compliance Validation

### Development Checklist

- [ ] No Node.js APIs used in component code
- [ ] shadcn/ui Card component used as base
- [ ] ESM export configured in main index.ts
- [ ] TailwindCSS classes used for all styling
- [ ] Lucide React icons only (no emoticons)
- [ ] TypeScript strict mode compliance
- [ ] Component props interface comprehensive
- [ ] Storybook stories created with responsive examples
- [ ] Unit tests with >80% coverage
- [ ] Bundle size impact measured
- [ ] Accessibility attributes included
- [ ] Parent width inheritance verified

## Risk Assessment

### Technical Risks
- **Low**: shadcn/ui integration complexity (well-documented)
- **Low**: Performance impact (minimal container component)
- **Low**: Bundle size impact (small component footprint)

### Mitigation Strategies
- Follow shadcn/ui official setup guide
- Implement performance testing during development
- Monitor bundle size with build analysis tools

## Success Metrics

**Technical Metrics**:
- Component renders in < 16ms
- Bundle size impact < 2KB gzipped
- Test coverage > 80%
- Zero ESLint warnings
- TypeScript strict mode compliance

**User Experience Metrics**:
- Storybook renders without errors
- Responsive behavior works across viewports
- TailwindCSS theming applies correctly
- Component integrates seamlessly with parent containers

## Next Steps

1. Execute `/speckit.tasks` to generate detailed implementation tasks
2. Begin Phase 0: shadcn/ui setup and integration
3. Proceed through Phase 1-2 according to task dependencies
4. Validate constitution compliance at each phase
5. Complete with ESM export and documentation updates