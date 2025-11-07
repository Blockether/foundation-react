# Implementation Plan: SQL Cockpit Component

**Branch**: `002-sql-cockpit` | **Date**: 2025-11-06 | **Spec**: [SQL Cockpit Component](./spec.md)
**Input**: Feature specification from `/specs/002-sql-cockpit/spec.md`

## Summary

The SQL Cockpit component will provide a comprehensive SQL query interface that integrates Monaco Editor and DuckDB-WASM for browser-based SQL execution. This component will feature a professional toolbar with Run, Format, and Select Query functions, a large SQL editor with syntax highlighting, and a results display area that can show formatted tables or error messages. The component will be fully embeddable within the CockpitsComposer and maintain complete shadcn/ui design system compatibility.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18
**Primary Dependencies**: shadcn/ui, TailwindCSS, Lucide React, Vite
**Storage**: Browser-only (DuckDB-WASM, no server storage)
**Testing**: Jest + React Testing Library + Storybook
**Target Platform**: Modern browsers (ES2020+) - Browser Only!
**Project Type**: UI component library (ESM distribution)
**Performance Goals**: Optimal bundle size, tree-shaking, runtime performance
**Constraints**: No Node.js support, single ESM output, shadcn/ui compatibility
**Scale/Scope**: Component library for Python backend integration

**Key Technologies**:
- Monaco Editor: Code editing with SQL syntax highlighting and formatting
- DuckDB-WASM: In-browser analytical SQL database engine
- sql-formatter: SQL query formatting (already in dependencies)
- @monaco-editor/react: React wrapper for Monaco Editor
- @popsql/monaco-sql-languages: Enhanced SQL language support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Browser-only architecture** (no Node.js dependencies)
- ✅ **shadcn/ui foundation compliance** (all components built on shadcn/ui)
- ✅ **ESM-only distribution requirement** (single ESM bundle export)
- ✅ **TailwindCSS theming support** (full customization via CSS variables)
- ✅ **Lucide React icons only** (all toolbar icons use Lucide React)
- ✅ **Python library integration focus** (designed for DuckDB-WASM integration)

## Project Structure

### Documentation (this feature)

```text
specs/002-sql-cockpit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── component-interface.md
│   └── component-test.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/          # React components (TypeScript)
│   ├── ui/             # shadcn/ui based components
│   │   ├── card.tsx   # shadcn/ui Card component (already exists)
│   │   ├── button.tsx # shadcn/ui Button component
│   │   └── table.tsx  # shadcn/ui Table component
│   ├── sql/            # SQL-specific components
│   │   ├── sql-cockpit.tsx         # Main SQL Cockpit component
│   │   ├── sql-toolbar.tsx         # Toolbar with action buttons
│   │   ├── sql-editor.tsx          # Monaco Editor wrapper
│   │   ├── results-panel.tsx      # Results display component
│   │   ├── saved-queries.tsx       # Saved query dropdown
│   │   └── help-dialog.tsx         # Help documentation dialog
│   ├── foundation/     # Foundation-specific components
│   │   └── blockether-foundation-cockpit.tsx  # Already exists
│   └── data/           # Data visualization components
├── hooks/              # Custom React hooks
│   ├── use-duckdb-query.ts           # DuckDB query execution hook
│   ├── use-sql-formatter.ts          # SQL formatting hook
│   └── use-sql-autocomplete.ts       # SQL autocomplete hook
├── utils/              # Utility functions
│   └── sql-utils.ts                 # SQL parsing and formatting utilities
├── types/              # TypeScript type definitions
│   ├── foundation.ts  # Foundation types (already exists)
│   └── sql.ts         # SQL Cockpit specific types
└── index.ts            # Main entry point (ESM export)

stories/                # Storybook stories
├── sql/
│   └── sql-cockpit.stories.tsx  # SQL Cockpit component stories

tests/                  # Component tests
├── __mocks__/
│   └── @monaco-editor/react.tsx # Monaco Editor mock
├── unit/
│   └── sql/
│       ├── sql-cockpit.test.tsx      # Component unit tests
│       ├── sql-toolbar.test.tsx      # Toolbar unit tests
│       └── results-panel.test.tsx    # Results panel tests
└── integration/
    └── sql/
        ├── sql-cockpit-e2e.test.tsx   # End-to-end workflow tests
        └── duckdb-integration.test.tsx # DuckDB integration tests
```

**Structure Decision**: Component library structure optimized for ESM distribution and shadcn/ui integration, with dedicated SQL component module and comprehensive testing coverage.

## Phase 0: Research & Setup

### shadcn/ui Integration Research

**Current State**: Project has shadcn/ui initialized with Card component, TailwindCSS v4 configured
**Required Setup**: Monaco Editor integration, SQL language support, DuckDB-WASM React patterns

**Dependencies Analysis**:
- ✅ React 18+ (present)
- ✅ TypeScript (present)
- ✅ TailwindCSS (present, v4)
- ✅ Lucide React (present)
- ✅ @duckdb/duckdb-wasm (present)
- ✅ monaco-editor (present)
- ✅ sql-formatter (present)
- ❌ @monaco-editor/react (needs addition)
- ❌ @popsql/monaco-sql-languages (needs addition)

### Monaco Editor Integration Research

**Decision**: Use `@monaco-editor/react` with enhanced SQL language support
- **Monaco React**: Official wrapper handles complex setup automatically
- **SQL Languages**: Use `monaco-sql-languages` for enhanced syntax highlighting
- **Formatting**: Integrate existing `sql-formatter` with Monaco's formatting API
- **Theming**: Monaco theme API with TailwindCSS variables for consistency

### DuckDB-WASM Integration Research

**Decision**: React hooks pattern with built-in worker management
- **Hook Libraries**: Use established patterns for DuckDB-WASM React integration
- **Worker Management**: DuckDB-WASM handles worker threads automatically
- **Memory Management**: Implement streaming results and memory monitoring
- **Error Handling**: Comprehensive error boundaries and connection retry logic

### Component Architecture Research

**Layout Structure**:
```
CockpitsComposer (container)
└── SQLCockpit (main component)
    ├── SQLToolbar (top bar with actions)
    ├── SQLEditor (Monaco Editor wrapper)
    └── ResultsPanel (table/error display)
```

**Responsive Behavior**:
- Desktop: Full-width layout with fixed toolbar
- Tablet: Adaptive toolbar with icon-only mode
- Mobile: Stacked layout with collapsible toolbar

## Phase 1: Design & Architecture

### Component Interface Design

**Core Props Interface**:
```typescript
export interface SQLCockpitProps extends ComponentPropsWithoutRef<'div'> {
  initialQuery?: string;
  onQueryExecute?: (query: string) => Promise<QueryResult>;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  placeholder?: string;
  className?: string;
  savedQueries?: SavedQuery[];
  onSavedQuerySelect?: (query: SavedQuery) => void;
  showHelp?: boolean;
  helpContent?: ReactNode | string;
  editorMinHeight?: string;
  resultsMaxHeight?: string;
}
```

**Data Model**:
```typescript
export interface QueryResult {
  data: Record<string, any>[];
  columns: QueryColumn[];
  rowCount?: number;
  executionTime: number;
}

export interface QueryColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  nullable: boolean;
}

export interface SQLError {
  message: string;
  type: 'syntax' | 'runtime' | 'connection' | 'memory';
  line?: number;
  column?: number;
}
```

### Component Architecture

**Core Design Principles**:
1. **Professional Interface**: SQL editor with Monaco-level functionality
2. **Responsive Design**: Adapts to different screen sizes
3. **Theme Integration**: Full TailwindCSS and shadcn/ui compatibility
4. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
5. **Performance**: Lazy loading and code splitting for optimal bundle size

**Monaco Editor Integration**:
- **Language Support**: Enhanced SQL syntax highlighting
- **Formatting**: Built-in SQL formatter integration
- **Autocomplete**: SQL keywords and database schema completion
- **Theming**: TailwindCSS variable integration

**DuckDB-WASM Integration Strategy**:
- **Hook Pattern**: `useDuckDBQuery` for query execution
- **Data Flow**: Arrow format for efficient data transfer
- **Memory Management**: Streaming results and monitoring
- **Error Handling**: Comprehensive error boundaries and recovery

### shadcn/ui Integration Strategy

**Component Structure**:
- **Base Components**: Card, Button, Table for consistent design
- **Toolbar Layout**: Flexbox with proper spacing and alignment
- **Icon Usage**: Lucide React icons for all toolbar actions
- **Theme System**: CSS variables for dark/light mode support

**Styling Approach**:
- **TailwindCSS Classes**: All styling through utility classes
- **CSS Variables**: Theme tokens integrated with shadcn/ui system
- **Responsive Design**: Mobile-first approach with breakpoints
- **Custom Classes**: Minimal custom CSS for specific component needs

## Phase 2: Implementation Strategy

### Development Approach

1. **Component Setup**: Create component structure and TypeScript interfaces
2. **Monaco Integration**: Implement SQL editor with syntax highlighting
3. **Toolbar Implementation**: Build action buttons with proper accessibility
4. **DuckDB Integration**: Create query execution hooks
5. **Results Display**: Implement table and error handling components
6. **Theme Integration**: Ensure dark/light mode compatibility
7. **Testing**: Comprehensive unit and integration tests
8. **Documentation**: Create Storybook stories and usage examples

### Quality Gates

- **TypeScript Strict Mode**: All code must pass strict type checking
- **ESLint Rules**: Zero warnings, proper React patterns
- **Bundle Size**: Component contribution < 150KB gzipped (excluding Monaco/DuckDB)
- **Performance**: Initial render < 100ms, query feedback < 3s
- **Accessibility**: WCAG 2.1 AA compliance verified
- **Test Coverage**: >80% line coverage for all component logic

## Complexity Tracking

> **No constitution violations - all complexity is justified and minimal**

| Complexity Area | Justification | Simpler Alternative Rejected Because |
|-----------------|---------------|--------------------------------------|
| Monaco Editor | Professional SQL editing experience required | Textarea lacks syntax highlighting, formatting, and autocompletion needed for serious SQL work |
| DuckDB-WASM | Browser-based analytical SQL capability required | Client-server SQL would violate browser-only constitution requirement |
| Monaco React Wrapper | Complex Monaco setup and worker management | Direct Monaco integration requires extensive webpack configuration and is error-prone |
| Enhanced SQL Language | Professional SQL development experience | Basic Monaco SQL support lacks function recognition and dialect-specific features |

## Constitution Compliance Validation

### Development Checklist

- [ ] No Node.js APIs used in component code
- [ ] shadcn/ui components used as base for all UI elements
- [ ] ESM export configured in main index.ts
- [ ] TailwindCSS classes used for all styling
- [ ] Lucide React icons only (no emoticons)
- [ ] TypeScript strict mode compliance
- [ ] Component props interface comprehensive
- [ ] Storybook stories created with all variants
- [ ] Unit tests with >80% coverage
- [ ] Bundle size impact measured and optimized
- [ ] Accessibility attributes included
- [ ] Dark/light theme support verified

### Risk Assessment

### Technical Risks (Medium)
1. **Monaco Editor Bundle Size**
   - **Mitigation**: Lazy loading, code splitting, selective imports
   - **Impact**: Medium, manageable with optimization strategies

2. **DuckDB-WASM Memory Constraints**
   - **Mitigation**: Streaming results, memory monitoring, error boundaries
   - **Impact**: Medium, requires careful implementation

3. **Browser Compatibility**
   - **Mitigation**: Feature detection, progressive enhancement, fallbacks
   - **Impact**: Low-Medium, affects older browsers only

### Implementation Risks (Low)
1. **Component Complexity**
   - **Mitigation**: Component composition, clear separation of concerns
   - **Impact**: Low, well-defined component structure

2. **Performance Impact**
   - **Mitigation**: Lazy loading, code splitting, optimized queries
   - **Impact**: Low, manageable with best practices

## Success Metrics

**Technical Metrics**:
- Component renders in under 100ms initial load time
- Bundle size impact < 150KB gzipped (excluding dependencies)
- Test coverage > 80%
- Zero ESLint warnings
- TypeScript strict mode compliance

**User Experience Metrics**:
- Storybook renders without errors
- SQL query execution feedback within 3 seconds
- Error messages displayed within 500ms
- Responsive behavior works across viewports
- Dark/light theme switching works correctly
- Screen reader navigation and announcements work properly

**Integration Metrics**:
- Embeds within CockpitsComposer seamlessly
- DuckDB-WASM integration functions correctly
- Monaco Editor features (formatting, autocomplete) work properly
- TailwindCSS theming applies correctly
- ESM export functions correctly

## Next Steps

1. Execute `/speckit.tasks` to generate detailed implementation tasks
2. Begin Phase 1: Component structure and interface design
3. Proceed through Phase 2-4 according to task dependencies
4. Validate constitution compliance at each phase
5. Complete with ESM export and documentation updates

---

**Research Status**: ✅ COMPLETED
- Monaco Editor integration patterns identified and validated
- DuckDB-WASM React hooks patterns researched
- Component architecture designed
- shadcn/ui integration strategy established
- Performance and accessibility requirements analyzed

**Phase 1 Status**: ✅ COMPLETED
- Component interfaces designed with comprehensive TypeScript types
- Data models created for queries, results, and errors
- API contracts defined for component interface and testing
- Quickstart guide created with comprehensive examples
- Agent context updated with new technologies

**Ready for**: `/speckit.tasks` command to generate implementation task breakdown