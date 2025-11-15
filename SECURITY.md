# Security Policy

Reasoner operates in environments where prompts, provider keys, and cached traces are sensitive. This document summarizes our support commitments and the controls we expect downstream users to enforce.

## Supported versions

| Version | Status                                         |
| ------- | ---------------------------------------------- |
| 2.x     | supported with patches                         |
| 1.x     | best-effort (security fixes may be backported) |
| < 1.0   | unsupported                                    |

## Reporting vulnerabilities

- Email `security@nullure.ai` (PGP available on request); avoid public issues for fresh findings.
- Include reproduction steps, impact, and suggested mitigations if known.
- Acknowledgment within 48h, triage within 7 days, coordinated disclosure for critical fixes within 30 days when feasible.

## Secrets and configuration

- API keys must live in env vars or secret stores. Never commit `.env` files or copy keys into docs, fixtures, or tests.
- `reasonbench/runner.ts` no longer ships fallback keys—set `BENCH_API_KEY` or provider-specific envs before running live benches.
- Rotate provider keys regularly and use scoped keys per environment (dev/stage/prod).

## Input and output handling

- `classify_query` enforces length limits; keep upstream gateways capped at 10k characters.
- Treat all user prompts as hostile. Apply your own validation before calling `openreason.reason` if operating in a multi-tenant setting.
- The verifier pipeline (`verify_math_reasoning`, `verify_logic_consistency`, critic prompts) reduces injection risk but does not eliminate it. Use structured output contracts (JSON schemas) in your integrations when possible.

## Memory + persistence

- Memory uses Keyv + SQLite stored at `./data/memory.db` by default. The file is local-only; set `memory.enabled=false` when handling regulated data unless you manage storage encryption yourself.
- To purge traces run `rm ./data/memory.db`. Consider putting the file on encrypted volumes when deploying to shared hosts.

## Dependencies and runtime

- Run `npm audit` or `npm audit --production` before releases.
- Keep Node.js ≥ 18.18 LTS; older runtimes miss TLS updates required by some providers.
- Use lockfiles to avoid accidental upgrades of LangChain/provider SDKs.

## Production hardening checklist

- [ ] Configure HTTPS termination and CORS/CSRF policies when exposing Reasoner via HTTP APIs.
- [ ] Apply rate limiting (`rate-limiter-flexible`, API gateway quotas, etc.).
- [ ] Collect redactable logs (never print prompts with secrets). Prefer structured logs with trace IDs.
- [ ] Mask stack traces in user-facing responses; use `log_error` for internal diagnostics.
- [ ] Monitor constraint violations and verifier failures; these often signal attempted prompt injections.
- [ ] Schedule backups for memory DBs or disable memory entirely in shared deployments.

## Third-party providers

- Reasoner forwards prompts to whichever provider you select. Their retention policies apply; enable “no training” flags where supported (OpenAI/Anthropic optional parameters, Gemini data controls, etc.).
- For maximum privacy, substitute provider SDKs that target self-hosted models; ensure the interface matches the subset used by `src/api/provider.ts`.

## Known limitations

1. **No built-in auth** – secure your API surface area separately.
2. **Local memory only** – scaling beyond a single host requires managed Keyv or other storage layers you control.
3. **Prompt injection defenses are heuristic** – deterministic guarantees require custom allow-lists and output schemas.
4. **Benchmark runner** assumes trusted environments; it will exit when no keys are present rather than faking results.

## Roadmap items

- Encrypted memory adapter (Keyv + sqlite cipher or libsql).
- Provider-specific “safe prompt” templates and automated red-team suites.
- Built-in rate limiter + circuit breaker middleware.
- Optional audit log streamer with hash chaining.

_Last updated: 15 Nov 2025_
