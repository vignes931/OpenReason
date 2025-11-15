# troubleshooting

## provider authentication failed

```
Error: invalid api key
```

1. Confirm the right environment variable is set (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.).
2. Pass the key explicitly to `openreason.init` if you do not want to rely on env vars.

```typescript
openreason.init({ provider: "openai", apiKey: "sk-proj-...", model: "gpt-4o" });
```

## module not found

```
Error: Cannot find module 'openreason'
```

- Install the package: `npm install openreason`.
- Make sure TypeScript resolves ESM modules by enabling `"module": "ES2022"` and `"moduleResolution": "node"` in `tsconfig.json`.

## request timed out

```
Error: request timeout exceeded
```

- Increase `performance.timeout`.
- Use the `mock` provider while debugging network issues.

```typescript
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  performance: { timeout: 60000 },
});
```

## memory sqlite locked

If you re-use the same `memory.path` from multiple processes, SQLite can lock the file.

```typescript
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  memory: { enabled: true, path: "./data/memory-instance-2.db" },
});
```

Or disable memory entirely:

```typescript
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  memory: { enabled: false, path: "" },
});
```

## confidence too low

- Use stronger `model` / `complexModel` pairs.
- Increase the `logical` weight if your use case prioritizes reasoning correctness.
- Enable memory so repeat questions gain an automatic confidence bump.

```typescript
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  complexModel: "gpt-4o",
  weights: { logical: 0.55, rule: 0.3, empathy: 0.15 },
  memory: { enabled: true, path: "./data/memory.db" },
});
```

## CLI cannot find env vars

Run commands with `--env my.env` or export the variables before invoking `npx openreason`.

```bash
set OPENAI_API_KEY=sk-...
npx openreason "solve 12 * 14"
# or
npx openreason --env .env.local "prove that sqrt(2) is irrational"
```

## high latency in reflex questions

If trivial prompts still take the full pipeline:

- Provide a `simpleModel` to keep reflex calls cheap.
- Disable memory to confirm caching is not waiting on disk.
- Verify that queries are genuinely simple; the router will escalate depth if it detects structure or safety issues.
