# GitHub Copilot — Repository Instructions

This file provides repository-level guidance for GitHub Copilot in VS Code. It is intended
for human reviewers and for any automated tooling that generates repository-specific
Copilot instruction files.

Repository: x-posts-scheduler
Constitution: `.specify/memory/constitution.md` (required reading — Copilot outputs must comply)

---

## Goal

Make Copilot suggestions useful and safe while ensuring generated code follows project
policies: TDD (tests-first), linting/formatting, accessibility, documentation, and X API
v2 compliance.

## High-level rules (enforced for all Copilot use)

- Tests-first (TDD): When coding behavior or core logic, write tests before implementation.
  Tests MUST be included in the same PR. For core logic, coverage MUST be 100%.
- Linting & formatting: All generated code must pass ESLint/Prettier (or the project's
  configured equivalents). Run fixers locally and include lint/format CI evidence in PRs.
- Documentation: For any design or architecture changes, create or update ADRs in
  `/docs/adrs/`. Add or update relevant Mermaid diagrams in `/docs/diagrams/` when flows
  or data models change.
- Accessibility & performance: UI-affecting code must include accessibility acceptance
  criteria (WCAG 2.1 AA where practical) and performance targets (e.g., <2s for primary
  flows). Include verification steps in the PR.
- Secrets & tokens: NEVER include secrets, tokens, or private keys in generated code.
  Secrets MUST be loaded from environment variables or a secrets manager; add notes to the
  PR about required secret configuration for deployment and CI.
- X API v2 integration: Any Copilot-generated code that integrates with X API v2 MUST
  adhere to platform policies: use OAuth 2.0 flows for user actions, implement rate-limit
  handling, and include user consent flows for actions performed on users' behalf.

## Suggested prompt templates (examples)

- "Create failing unit tests for the post scheduling logic that verify [behavior]. Use the
  project's test framework and place tests under `tests/unit/`. Do not implement the
  production code — tests only."

- "Implement the minimal production code to make the tests in `tests/unit/test_scheduler.py`
  pass. Follow SOLID principles, add type annotations, and ensure ESLint/Prettier passes."

- "Generate a Mermaid sequence diagram for the OAuth flow between the user, app, and X API
  v2. Place the diagram under `/docs/diagrams/oauth-flow.md`."

## Local workflow recommendations

1. Write tests first (TDD). Commit tests with a message like: `test: add failing tests for X`.
2. Run tests and watch them fail. Commit the failing test state where helpful.
3. Use Copilot to generate implementation suggestions. Review and adapt code — do not accept
   verbatim without inspection.
4. Run lint/format and test locally. Iterate until tests pass and lint/format is clean.
5. Update ADRs/diagrams/docs as required and add them to the PR.
6. Push and allow CI to run. Ensure CI artifacts (coverage, lint) are present in the PR.

## Reviewers: what to check in PRs that include Copilot-generated content

- Verify tests were created first and initially failed.
- Verify the implementation only adds what is necessary to satisfy tests.
- Confirm unit/integration tests are deterministic and do not rely on external flaky services.
- Confirm ESLint/Prettier passes and that no secrets were added.
- Confirm documentation (ADRs/diagrams) updated if design changed.
- For any X API v2 usage, confirm OAuth scopes and rate-limit handling are documented.

## Example: minimal `.github/copilot-instructions.md` metadata (human-readable)

- preferred_client: "GitHub Copilot (VS Code)"
- required_checks:
  - tdd: true
  - core_coverage: "100% for core logic"
  - linting: "ESLint + Prettier"
  - docs: "/docs/adrs/, /docs/diagrams/"

---

## Notes

- This file is a repository-level guidance document only. It does NOT replace the
  project constitution in `.specify/memory/constitution.md` — that file is the source of
  truth for governance and MUST be referenced by all agents and reviewers.
- If you want this file to be auto-generated or kept in sync by tooling, ensure the
  `.specify/scripts/bash/update-agent-context.sh` script is run in your environment.

---

Last updated: 2025-11-04

## Recent Changes
- 001-x-post-creator: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
