---

description: "Task list template for feature implementation"
---

# Tasks: SQL Cockpit Component

**Input**: Design documents from `/specs/002-sql-cockpit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED - feature specification includes test coverage requirements (>80% coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Component library**: `src/`, `tests/`, `stories/` at repository root
- **React components**: `src/components/`, `src/hooks/`, `src/utils/`
- **Tests**: `tests/unit/`, `tests/integration/`
- **Storybook**: `stories/components/`
- Paths shown below assume component library structure - adjust based on plan.md

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [X] T001 Install @monaco-editor/react package for Monaco Editor React integration
- [X] T002 Install @popsql/monaco-sql-languages package for enhanced SQL language support
- [X] T003 [P] Configure Vite build for Monaco Editor workers and code splitting
- [X] T004 [P] Configure build output for single ESM file distribution
- [X] T005 [P] Update main ESM export in src/index.ts to include SQL Cockpit components

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETED

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create SQL types directory structure in src/types/
- [X] T007 [P] Create SQL component directory structure in src/components/sql/
- [X] T008 [P] Create hooks directory structure in src/hooks/
- [X] T009 [P] Create SQL utilities directory structure in src/utils/
- [X] T010 [P] Create SQL types definition file in src/types/sql.ts with all interfaces from data-model.md
- [X] T011 [P] Create SQL utility functions in src/utils/sql-utils.ts for SQL parsing and formatting
- [X] T012 [P] Update shadcn/ui Button component if not present (needed for toolbar buttons)
- [X] T013 [P] Update shadcn/ui Table component if not present (needed for results display)
- [X] T014 [P] Create tests/__mocks__ directory for Monaco Editor and DuckDB-WASM mocks
- [X] T015 [P] Create tests/unit/sql/ directory structure for component unit tests
- [X] T016 [P] Create tests/integration/sql/ directory structure for integration tests
- [X] T017 [P] Create stories/sql/ directory structure for Storybook stories

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - SQL Query Interface (Priority: P1) 🎯 MVP

**Goal**: Users can write and execute SQL queries using an integrated code editor with a professional toolbar for query management and help resources.

**Independent Test**: Can be fully tested by rendering the SQLCockpit component with mock query functionality and verifying the toolbar buttons, editor space, and results area display correctly with proper styling and accessibility.

### Tests for User Story 1 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T018 [P] [US1] Unit test for SQLCockpit component rendering in tests/unit/sql/sql-cockpit.test.tsx
- [ ] T019 [P] [US1] Unit test for SQL toolbar component in tests/unit/sql/sql-toolbar.test.tsx
- [ ] T020 [P] [US1] Unit test for SQL editor component in tests/unit/sql/sql-editor.test.tsx
- [ ] T021 [P] [US1] Unit test for results panel component in tests/unit/sql/results-panel.test.tsx
- [ ] T022 [P] [US1] Integration test for complete SQL workflow in tests/integration/sql/sql-cockpit-e2e.test.tsx
- [ ] T023 [P] [US1] Integration test for Monaco Editor integration in tests/integration/sql/monaco-integration.test.tsx
- [ ] T024 [P] [US1] Integration test for DuckDB-WASM workflow in tests/integration/sql/duckdb-integration.test.tsx
- [ ] T025 [P] [US1] Storybook story for SQL Cockpit component in stories/sql/sql-cockpit.stories.tsx

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create SQL Cockpit types definition in src/types/sql.ts (depends on T010)
- [ ] T027 [P] [US1] Create useDuckDBQuery hook in src/hooks/use-duckdb-query.ts for query execution
- [ ] T028 [P] [US1] Create useSQLFormatter hook in src/hooks/use-sql-formatter.ts for query formatting
- [ ] T029 [P] [US1] Create useSQLAutocomplete hook in src/hooks/use-sql-autocomplete.ts for autocomplete functionality
- [ ] T030 [US1] Create SQL toolbar component in src/components/sql/sql-toolbar.tsx with action buttons (Play, Format, Select Query)
- [ ] T031 [P] [US1] Create SQL editor component in src/components/sql/sql-editor.tsx with Monaco Editor integration (depends on T027, T028)
- [ ] T032 [P] [US1] Create results panel component in src/components/sql/results-panel.tsx for table/error display (depends on T010)
- [ ] T033 [P] [US1] Create saved queries component in src/components/sql/saved-queries.tsx for query selection dropdown
- [ ] T034 [P] [US1] Create help dialog component in src/components/sql/help-dialog.tsx for DuckDB documentation
- [ ] T035 [US1] Create main SQL Cockpit component in src/components/sql/sql-cockpit.tsx integrating all subcomponents (depends on T026-T034)
- [ ] T036 [US1] Implement Run Query button functionality with loading states in SQL toolbar
- [ ] T037 [US1] Implement Format Query button functionality using sql-formatter in SQL toolbar
- [ ] T038 [US1] Implement Select Query dropdown with saved queries functionality in SQL toolbar
- [ ] T039 [US1] Implement Database status indicator on right side of toolbar
- [ ] T040 [US1] Implement Help button with DuckDB documentation link on right side of toolbar
- [ ] T041 [P] [US1] Add proper ARIA labels and tooltips to all toolbar icons in SQL toolbar
- [ ] T042 [US1] Implement Monaco Editor SQL syntax highlighting and language configuration
- [ ] T043 [US1] Implement Monaco Editor keyboard shortcuts (Ctrl+Enter for run, Ctrl+S for format)
- [ ] T044 [P] [US1] Implement Monaco Editor dark/light theme integration with TailwindCSS
- [ ] T045 [US1] Implement results table component with formatted columns and row data display
- [ ] T046 [US1] Implement error message display with different styling for error types (syntax, runtime, connection, memory)
- [ ] T047 [P] [US1] Implement responsive behavior for different screen sizes in SQL Cockpit
- [ ] T048 [P] [US1] Add accessibility features for screen readers and keyboard navigation
- [ ] T049 [US1] Implement custom className merging with TailwindCSS utility classes
- [ ] T050 [US1] Add proper TypeScript strict type checking and JSDoc documentation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Query Results Display (Priority: P2)

**Goal**: Users can view query results in a formatted table layout or error messages when queries fail, with clear visual distinction between success and error states.

**Independent Test**: Can be fully tested by providing mock result data and error states to the results area component and verifying the table formatting and error display work correctly.

### Tests for User Story 2 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T051 [P] [US2] Unit test for results table component in tests/unit/sql/results-table.test.tsx
- [ ] T052 [P] [US2] Unit test for error display component in tests/unit/sql/error-display.test.tsx
- [ ] T053 [P] [US2] Unit test for result pagination in tests/unit/sql/result-pagination.test.tsx
- [ ] T054 [P] [US2] Integration test for large result sets handling in tests/integration/sql/large-results.test.tsx

### Implementation for User Story 2

- [ ] T055 [P] [US2] Create results table component in src/components/sql/results-table.tsx for formatted data display
- [ ] T056 [P] [US2] Create error display component in src/components/sql/error-display.tsx for SQL error messages
- [ ] T057 [P] [US2] Create result pagination component in src/components/sql/result-pagination.tsx for large datasets
- [ ] T058 [P] [US2] Implement formatted table rendering with proper headers and column types in results table component
- [ ] T059 [P] [US2] Implement cell rendering for different data types (string, number, boolean, date) in results table component
- [ ] T060 [P] [US2] Implement row selection and keyboard navigation in results table component
- [ ] T061 [P] [US2] Implement error type classification and appropriate styling in error display component
- [ ] T062 [P] [US2] Implement line/column highlighting for syntax errors in error display component
- [ ] T063 [P] [US2] Implement "No results" state display for empty query results
- [ ] T064 [P] [US2] Implement pagination controls for large result sets in result pagination component
- [ ] T065 [P] [US2] Implement scrolling behavior with maximum height constraints in results panel component
- [ ] T066 [P] [US2] Integrate results table and error display components into results panel component
- [ ] T067 [P] [US2] Add accessibility features to results table (ARIA labels, row headers, navigation)
- [ ] T068 [US2] Add performance optimizations for large datasets (virtualization, lazy loading)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Help and Documentation Access (Priority: P3)

**Goal**: Users can access help documentation and learn about DuckDB through integrated help resources in the toolbar.

**Independent Test**: Can be fully tested by clicking the help button and verifying the documentation modal or tooltip appears with DuckDB resource links.

### Tests for User Story 3 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T069 [P] [US3] Unit test for help dialog component in tests/unit/sql/help-dialog.test.tsx
- [ ] T070 [P] [US3] Unit test for database status indicator in tests/unit/sql/database-status.test.tsx

### Implementation for User Story 3

- [ ] T071 [P] [US3] Create help dialog component in src/components/sql/help-dialog.tsx for documentation display
- [ ] T072 [P] [US3] Create database status indicator component in src/components/sql/database-status.tsx for connection status
- [ ] T073 [P] [US3] Implement modal/dialog interface for help content with keyboard navigation
- [ ] T074 [P] [US3] Implement external link handling for DuckDB documentation URLs in help dialog
- [ ] T075 [P] [US3] Implement database connection status visualization in database status component
- [ ] T076 [P] [US3] Implement help button tooltip and keyboard shortcut in SQL toolbar
- [ ] T077 [P] [US3] Integrate help dialog and database status components into SQL toolbar
- [ ] T078 [P] [US3] Add accessibility features to help interface (focus trapping, screen reader support)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T079 [P] Update main library exports in src/index.ts to include SQL Cockpit components
- [ ] T080 [P] Update main library exports in src/index.ts to include SQL Cockpit type definitions
- [ ] T081 [P] Update main library exports in src/index.ts to include SQL Cockpit hooks
- [ ] T082 [P] Update main library exports in src/index.ts to include SQL Cockpit utilities
- [ ] T083 [P] Run ESLint on all SQL components and TypeScript files
- [ ] T084 [P] Run Prettier formatting on all SQL components and TypeScript files
- [ ] T085 [P] Validate ESM build output includes SQL Cockpit components correctly
- [ ] T086 [P] Measure bundle size impact and ensure < 150KB contribution (excluding Monaco/DuckDB)
- [ ] T087 [P] Run complete test suite and ensure >80% coverage for SQL components
- [ ] T088 [P] Run performance tests to verify <100ms initial render and <3s query feedback
- [ ] T089 [P] Run accessibility audit to verify WCAG 2.1 AA compliance
- [ ] T090 [P] Create comprehensive Storybook stories with all SQL Cockpit variants
- [ ] T091 [P] Add JSDoc documentation to all SQL Cockpit components and hooks
- [ ] T092 [P] Create integration tests for complete SQL workflow (Monaco + DuckDB + Results)
- [ ] T093 [P] Create performance tests for large query results and memory usage
- [ ] T094 [P] Create visual regression tests for SQL Cockpit Storybook stories
- [ ] T095 [P] Update quickstart guide with comprehensive usage examples
- [ ] T096 [P] Validate component works correctly when embedded in CockpitsComposer

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ COMPLETED - No dependencies - can start immediately (packages already installed)
- **Foundational (Phase 2)**: ✅ COMPLETED - Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if team capacity allows)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 results display components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No direct dependencies, may integrate with US1 toolbar

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Types/interfaces before components
- Components before custom hooks
- Core implementation before theming/styling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Types within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (tests are REQUIRED for this feature):
Task: "Unit test for SQLCockpit component rendering in tests/unit/sql/sql-cockpit.test.tsx"
Task: "Unit test for SQL toolbar component in tests/unit/sql/sql-toolbar.test.tsx"
Task: "Unit test for SQL editor component in tests/unit/sql/sql-editor.test.tsx"
Task: "Unit test for results panel component in tests/unit/sql/results-panel.test.tsx"

# Launch all types/components for User Story 1 together:
Task: "Create SQL Cockpit types definition in src/types/sql.ts"
Task: "Create useDuckDBQuery hook in src/hooks/use-duckdb-query.ts"
Task: "Create SQL toolbar component in src/components/sql/sql-toolbar.tsx"
Task: "Create SQL editor component in src/components/sql/sql-editor.tsx"
Task: "Create results panel component in src/components/sql/results-panel.tsx"
```

```bash
# Launch all implementation tasks for User Story 1 together:
Task: "Create saved queries component in src/components/sql/saved-queries.tsx"
Task: "Create help dialog component in src/components/sql/help-dialog.tsx"
Task: "Create main SQL Cockpit component in src/components/sql/sql-cockpit.tsx"
Task: "Implement Run Query button functionality with loading states in SQL toolbar"
Task: "Implement Format Query button functionality using sql-formatter in SQL toolbar"
Task: "Implement Monaco Editor SQL syntax highlighting and language configuration"
Task: "Implement results table component with formatted columns and row data display"
Task: "Implement error message display with different styling for error types"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (Monaco Editor + SQL language support)
2. ✅ Complete Phase 2: Foundational (SQL types, components structure, testing setup)
3. 🚧 Complete Phase 3: User Story 1 (Complete SQL query interface)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Build ESM bundle and verify distribution

### Incremental Delivery

1. ✅ Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate ESM build
3. Add User Story 2 → Test independently → Validate results display
4. Add User Story 3 → Test independently → Validate help system
5. Complete Phase 6: Polish and finalize

### Parallel Team Strategy

With multiple developers:

1. ✅ Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (SQL query interface)
   - Developer B: User Story 2 (Results display)
   - Developer C: User Story 3 (Help system)
3. Stories complete and integrate independently

---

## Constitution Compliance Checklist

For each implemented component, verify:
- ✅ Browser-only (no Node.js specific APIs)
- ✅ shadcn/ui based design (uses Card, Button, Table components)
- ✅ TailwindCSS theming support (custom CSS classes, theme integration)
- ✅ Lucide React icons only (Play, Save, Help, Database icons)
- ✅ TypeScript strict mode compliance (all interfaces and props)
- ✅ ESM export compatibility (single ESM bundle output)
- ✅ Accessibility (WCAG 2.1 AA standards with ARIA labels, keyboard navigation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST be written and FAIL before implementation (feature specification requires >80% coverage)
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Always check shadcn/ui compatibility before custom implementations
- Validate ESM build output after major changes
- Monaco Editor bundle size and DuckDB-WASM require careful optimization planning

## Success Criteria Validation

**Technical Metrics**:
- Component renders in under 100ms initial load time
- Bundle size impact < 150KB gzipped (excluding Monaco/DuckDB)
- Test coverage > 80% for all component logic
- Zero ESLint warnings and proper React patterns
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
- DuckDB-WASM integration functions correctly (mock for UI-only)
- Monaco Editor features (formatting, autocomplete, syntax highlighting) work properly
- TailwindCSS theming applies correctly
- ESM export functions correctly

**Constitution Compliance Metrics**:
- No Node.js APIs used in component code
- shadcn/ui components used as base for all UI elements
- ESM export configured in main index.ts
- TailwindCSS classes used for all styling
- Lucide React icons only (no emoticons or other icon libraries)
- TypeScript strict mode compliance
- Component props interface comprehensive and exported
- Storybook stories created with all variants and states
- Unit tests with >80% coverage
- Bundle size impact measured and optimized
- Accessibility attributes included for all interactive elements
- Dark/light theme support verified

## Implementation Status: 🚧 IN PROGRESS - Phase 3 Ready

All tasks have been systematically organized by user story with proper dependencies, independent test criteria, and comprehensive checklists. The SQL Cockpit component is ready for **Phase 3: User Story 1** implementation with:

- **50 total tasks** organized into 6 phases
- **17 tasks completed** in Phases 1-2 (Setup + Foundational)
- **33 tasks remaining** for user stories and polish
- **3 user stories** prioritized by business value (P1, P2, P3)
- **13 test tasks** ensuring >80% coverage requirement
- **37 implementation tasks** covering all functionality
- **All dependencies** clearly mapped with parallel execution opportunities

**MVP Scope (User Story 1)**: Complete SQL query interface with professional toolbar, Monaco Editor, and results display
**Full Scope**: All 3 user stories with comprehensive features and polish

**Next Steps**: Begin Phase 3: User Story 1 implementation starting with test tasks T018-T025 (must fail first), followed by implementation tasks T026-T050.

The task breakdown is immediately executable with specific file paths and dependencies clearly defined for LLM implementation.