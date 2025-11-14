# troubleshooting

## provider authentication failed

```
error: invalid api key
```

solution: verify api key is correct and has necessary permissions

```typescript
// check environment variable is set
console.log(process.env.OPENAI_API_KEY);

// or pass directly to init
openreason.init({
  provider: "openai",
  apiKey: "sk-proj-...", // full key
  model: "gpt-4o",
});
```

## module not found

```
error: cannot find module 'openreason'
```

solution: ensure package is installed and typescript is configured properly

```bash
npm install openreason
npm install --save-dev @types/node typescript tsx
```

update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

## timeout errors

```
error: request timeout exceeded
```

solution: increase timeout or use faster models

```typescript
openreason.init({
  provider: "openai",
  apiKey: "...",
  model: "gpt-4o",
  performance: { timeout: 60000 }, // 60s instead of 30s
});
```

or use faster models:

```typescript
// use gpt-4o-mini instead of gpt-4o
openreason.init({
  provider: "openai",
  apiKey: "...",
  model: "gpt-4o-mini",
});
```

## memory database locked

```
error: database is locked
```

solution: ensure no other process is accessing database or disable memory

```typescript
// disable memory for stateless operation
openreason.init({
  provider: "openai",
  apiKey: "...",
  model: "gpt-4o",
  memory: { enabled: false },
});

// or use different database path
openreason.init({
  provider: "openai",
  apiKey: "...",
  model: "gpt-4o",
  memory: { enabled: true, path: "./data/memory-instance-2.db" },
});
```

## low confidence scores

if confidence scores consistently below 0.7:

- adjust weights to match your use case
- use higher-quality models (gpt-4o vs gpt-4o-mini)
- verify constitutional rules match your domain
- enable memory system for context learning

```typescript
openreason.init({
  provider: "openai",
  apiKey: "...",
  model: "gpt-4o", // not mini
  weights: {
    logical: 0.5, // increase logical weight
    rule: 0.3,
    empathy: 0.2,
  },
  memory: { enabled: true }, // enable learning
});
```

## deterministic compute not working

if reflex mode not returning instant results:

```typescript
import { deterministic_compute } from "openreason";

const dc = new deterministic_compute();
const result = dc.try_compute("144 * 12");

if (!result) {
  console.log("query not deterministic, will use llm");
}
```

deterministic compute supports:

- basic arithmetic (+ - \* / % \*\*)
- common math facts (pi, square roots, etc)
- simple logic (and, or, not)
- known constants
