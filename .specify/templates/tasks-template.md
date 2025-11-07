---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

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

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Components from data-model.md
  - Props/interfaces from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create component library structure per implementation plan
- [ ] T002 Initialize React/TypeScript project with shadcn/ui dependencies
- [ ] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode
- [ ] T004 [P] Setup Vite build configuration for ESM output
- [ ] T005 [P] Configure Jest with React Testing Library
- [ ] T006 [P] Setup Storybook configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup TailwindCSS configuration with custom theming
- [ ] T008 [P] Configure shadcn/ui theme and base components
- [ ] T009 [P] Setup Lucide React icons configuration
- [ ] T010 Create base component interfaces and types in `src/types/`
- [ ] T011 Configure build output for single ESM file distribution
- [ ] T012 Setup error boundary and error handling infrastructure
- [ ] T013 Create component testing utilities and helpers

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Unit test for [Component] in tests/unit/[component].test.tsx
- [ ] T015 [P] [US1] Integration test for [user journey] in tests/integration/[feature].test.tsx
- [ ] T016 [P] [US1] Storybook story for [Component] in stories/components/[component].stories.tsx

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create [Component] interface in src/types/[component].ts
- [ ] T018 [P] [US1] Create [Component] component in src/components/[category]/[component].tsx
- [ ] T019 [US1] Create custom hook for [Component] in src/hooks/use[feature].ts (depends on T017, T018)
- [ ] T020 [US1] Implement [Component] variants and theming support
- [ ] T021 [US1] Add accessibility attributes and ARIA support
- [ ] T022 [US1] Add Lucide React icons integration (if needed)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T023 [P] [US2] Unit test for [Component] in tests/unit/[component].test.tsx
- [ ] T024 [P] [US2] Integration test for [user journey] in tests/integration/[feature].test.tsx
- [ ] T025 [P] [US2] Storybook story for [Component] in stories/components/[component].stories.tsx

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create [Component] interface in src/types/[component].ts
- [ ] T027 [US2] Create [Component] component in src/components/[category]/[component].tsx
- [ ] T028 [US2] Implement [Component] with shadcn/ui integration
- [ ] T029 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T030 [P] [US3] Unit test for [Component] in tests/unit/[component].test.tsx
- [ ] T031 [P] [US3] Integration test for [user journey] in tests/integration/[feature].test.tsx

### Implementation for User Story 3

- [ ] T032 [P] [US3] Create [Component] interface in src/types/[component].ts
- [ ] T033 [US3] Create [Component] component in src/components/[category]/[component].tsx
- [ ] T034 [US3] Implement [Component] with TailwindCSS theming support

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates with JSDoc comments
- [ ] TXXX Code cleanup and TypeScript type refinements
- [ ] TXXX Bundle size optimization across all components
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Accessibility audit and WCAG compliance
- [ ] TXXX Storybook documentation updates
- [ ] TXXX ESM build validation and testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

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
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for [Component] in tests/unit/[component].test.tsx"
Task: "Integration test for [user journey] in tests/integration/[feature].test.tsx"
Task: "Storybook story for [Component] in stories/components/[component].stories.tsx"

# Launch all types/components for User Story 1 together:
Task: "Create [Component] interface in src/types/[component].ts"
Task: "Create [Component] component in src/components/[category]/[component].tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Build ESM bundle and verify distribution

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate ESM build
3. Add User Story 2 → Test independently → Validate bundle size
4. Add User Story 3 → Test independently → Validate theming
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Constitution Compliance Checklist

For each implemented component, verify:
- ✅ Browser-only (no Node.js specific APIs)
- ✅ shadcn/ui based design
- ✅ TailwindCSS theming support
- ✅ Lucide React icons only
- ✅ TypeScript strict mode compliance
- ✅ ESM export compatibility
- ✅ Accessibility (WCAG) standards

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Always check shadcn/ui compatibility before custom implementations
- Validate ESM build output after major changes