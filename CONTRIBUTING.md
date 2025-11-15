## Contributing to Reasoner

Thank you for helping advance transparent reasoning systems. This document captures the workflow we expect for every change.

### Core principles

1. **Benchmark-first** – never add hidden shortcuts or canned answers.
2. **Snake_case everything** – functions, variables, files. Classes stay `PascalCase` only if unavoidable.
3. **Deterministic diffs** – no auto-formatters; match the surrounding style.
4. **Tests before hype** – every change that touches the pipeline needs coverage.

### Getting started

```bash
git clone https://github.com/nullure/Reasoner.git
cd Reasoner
npm install
cp .env.example .env   # add provider API keys
npm run build          # type-check
npm test               # math, logic, pipeline sanity
```

### Branch + commit conventions

- Branches: `feature/<slug>` or `fix/<slug>` (lowercase, dashes allowed).
- Commits: imperative, lowercase verbs (`add verifier retries`, `fix router import`).
- Keep commits focused; squash locally if a PR contains noisy reversions.

### Coding standards

- Use TypeScript strict mode patterns already present (no implicit `any`).
- Stick to snake_case for files, functions, and variables (`classify_query`, `repair_reasoning`).
- Prefer small helpers over massive functions; each pipeline stage should stay under ~200 lines.
- Logging: use `log_info`/`log_error`. Debug logging was removed—do not add `console.log`.
- Comments are optional but keep them short and lowercase; add them only when the code is non-obvious.

### Tests and validation

| Area             | Expectation                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Unit/Pipeline    | `npm test` must pass (math, logic, reason suites). Add or update tests relevant to your change.  |
| Bench (optional) | Run `npm run bench` only if your change affects benchmarking; document quota blockers in the PR. |
| Type safety      | `npm run build` must succeed with zero warnings.                                                 |

When adding new files under `tests/`, keep them minimal and focused; avoid reintroducing broad fixture suites.

### Pull request checklist

1. Linked issue or rationale in the description.
2. Summary of changes, test evidence, and any follow-up TODOs.
3. Confirm no API keys or secrets were added to code, docs, or fixtures.
4. Reference updates to docs (`README`, `architecture.md`, etc.) when behavior changes.
5. Ensure CI can run without extra credentials (use mocks or guards when necessary).

### Where to help

- **Pipeline quality**: classifier accuracy, skeleton robustness, solver retries, verifier heuristics.
- **Memory system**: smarter similarity scoring, eviction policies, tracing tools.
- **Bench tooling**: new scenarios, scoring metrics, regression automation.
- **Docs/examples**: showcase integrations or troubleshoot common provider setups.

### Communication

- Use GitHub Issues for bugs/features; tag `benchmark` for regressions, `docs` for documentation work.
- Draft PRs early if you need architectural feedback.
- Security-sensitive findings should follow the instructions in `SECURITY.md`.

### License

By contributing you agree your code is released under the repository’s Apache-2.0 license.

Appreciate your help keeping Reasoner candid, auditable, and benchmark-ready.
