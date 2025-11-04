<!--
Sync Impact Report

- Version change: TEMPLATE -> 1.0.0

- Modified principles:
	- Template principle placeholders -> Replaced with concrete principles: "Test & TDD", "Clean Code & Design",
		"CI Quality: Linting & Formatting", "Accessible & Performant UI", "X API v2 Compliance & Security"
- Added sections:
	- Documentation (Mandatory)
	- Development Workflow & Quality Gates
- Removed sections: None (template placeholders resolved)
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
	- ⚠ .specify/templates/checklist-template.md (manual review recommended)
	- ⚠ .specify/templates/agent-file-template.md (manual review recommended)
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): original ratification date not provided; insert accurate date when known.
	- Audit `.specify/templates/checklist-template.md` and `agent-file-template.md` to include updated gates.
-->

# x-posts-scheduler Constitution

## Core Principles

### I. Test & TDD (NON-NEGOTIABLE)

- The project MUST follow Test-Driven Development (TDD): write tests first (Red), implement until tests pass
  (Green), then refactor. This cycle is mandatory for all production code and for any code touching core
  logic.
- Core logic (business rules, scheduling algorithms, critical validation) MUST maintain 100% test
  coverage. Coverage reports must be produced in CI and a failing status MUST block merges if core
  coverage drops below 100%.
- Tests are the specification: every new feature or behavior MUST be represented by tests that fail
  before implementation. Tests MUST be deterministic, fast, and focused; flaky tests are unacceptable
  and MUST be fixed or removed.

Rationale: TDD + full coverage for core logic prevents regressions, documents intent, and enables
confident refactoring.

### II. Clean Code & Design

- Code MUST adhere to clean code practices: SOLID principles, DRY, and KISS. Public interfaces and
  modules should be small, explicit, and well-typed.
- Design decisions MUST favor clarity and maintainability over cleverness. Complexity MUST be justified
  in the change notes and architecture decision records (ADRs).

Rationale: Readable, well-designed code reduces maintenance cost and speeds onboarding.

### III. CI Quality: Linting & Formatting

- ESLint (or equivalent for the primary language) and Prettier (or equivalent formatting) MUST run in
  CI on every push and pull request. Pull requests MUST pass linting and formatting checks before they
  can be merged. CI should auto-run fixers where safe and surface remaining issues clearly.

Rationale: Automated style and linting enforcement keeps the codebase consistent and reduces review
overhead.

### IV. Accessible & Performant UI

- All user-facing UI MUST target WCAG 2.1 AA accessibility standards where practical and include
  verification steps in the acceptance criteria. UI must be responsive across common device
  breakpoints.
- Primary user flows MUST load within 2 seconds on a typical user connection (measurable in
  performance tests) and performance goals MUST be stated in the plan for any feature that affects
  perceived latency.

Rationale: Accessibility and performance are core product qualities and are measurable acceptance
criteria for UI work.

### V. X API v2 Compliance & Security

- Integrations with X API v2 (the platform API) MUST comply with the platform's policies: use OAuth 2.0
  for user authorization where applicable, respect published rate limits, and avoid behavior that can be
  classified as spam. Tokens and secrets MUST never be committed; use environment-based secrets in CI.
- Any flow that can send content on behalf of a user MUST include explicit user consent and rate limit
  safeguards.

Rationale: Compliance avoids platform blocks, preserves user trust, and ensures sustainable product
operation.

## Documentation (Mandatory)

- Architecture Decision Records (ADRs) MUST be recorded under `/docs/adrs/`—one ADR per major
  decision, written in Markdown and linked from the relevant spec/plan.
- System and flow diagrams MUST use Mermaid and be stored under `/docs/diagrams/`. Include diagrams for
  OAuth flows, post-scheduling flows, and the primary data model.
- Documentation updates are MANDATORY at every phase gate: when a spec is accepted, when a plan is
  approved, and when implementation is completed. Each PR that changes behavior must update or note
  required ADRs/diagrams.

Rationale: Living documentation keeps design knowledge discoverable and reduces decision entropy.

## Development Workflow & Quality Gates

- Every pull request MUST include a "Constitution Check" section with evidence for:
  - Tests (link to failing tests before implementation and passing tests after)
  - Coverage report demonstrating core logic coverage
  - Lint/format status
  - Accessibility checks for UI changes
  - X API compliance notes if applicable (OAuth scope, rate limit expectations)
  - Documentation updates (ADRs/diagrams/spec changes)
- YAGNI: Features MUST NOT be implemented until proven necessary by measurable indicators or
  prioritized success metrics. Proposals that add speculative features MUST include a justification
  and an explicit metric that will validate the need.

Rationale: Gate checks make approvals objective and traceable; YAGNI prevents build-up of unused
complexity.

## Governance

- All decisions MUST trace to measurable success metrics included in the plan or spec. Every ADR MUST
  reference the metric(s) it affects.
- Agents and automation participating in development or review (including human-facing assistants)
  MUST reference this constitution in their decision summaries and provide a short note describing
  which principles were considered.
- Amendment procedure:
  1.  Propose amendments by editing this file and opening a pull request against `master`.
  2.  Change must include: rationale, migration plan for affected artifacts, and updated templates if
      applicable.
  3.  Approval requires at least two maintainers' approvals, one of whom must be a project
      maintainer with commit rights.
  4.  For breaking governance changes (removing or materially redefining principles) the version must
      be bumped MAJOR and a migration plan must be published.
- Versioning policy for the Constitution:
  - MAJOR: Backwards-incompatible governance changes or principle removals/redefinitions.
  - MINOR: Addition of new principle(s) or materially expanded guidance.
  - PATCH: Clarifications, wording, typo fixes, or non-semantic refinements.
- Compliance review expectations: periodic (quarterly) audits should validate adherence to core
  principles (TDD, coverage, linting, accessibility, API compliance). Audit results should be stored
  under `/docs/audits/`.

**Version**: 1.0.0 | **Ratified**: 2025-11-04: original ratification date unknown - insert
actual ratification date when available | **Last Amended**: 2025-11-04
