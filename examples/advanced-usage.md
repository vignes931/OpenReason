# advanced usage

## inspect rich metadata from a reasoning run

Every call to `openreason.reason` returns a structured `metadata` object that includes verification scores, structure detection, and quality metrics. You can log it or feed it into your own analytics.

```typescript
import openreason from "openreason";

openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
});

const result = await openreason.reason("prove that sqrt(2) is irrational");
console.log(result.metadata?.verificationScore);
console.log(result.metadata?.structure);
console.log(result.metadata?.issues);
```

## work with the built-in memory cache

Enable memory in `openreason.init` to log traces to a Keyv-backed SQLite store. Subsequent queries reuse high-confidence answers and you can monitor the cache via `get_memory_stats`.

```typescript
import openreason, { get_memory_stats } from "openreason";

openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  memory: { enabled: true, path: "./data/memory.db" },
});

await openreason.reason("what is photosynthesis?");
const cached = await openreason.reason("what is photosynthesis?");
console.log(cached.metadata?.cached); // true when pulled from memory
console.log(get_memory_stats());
```

## track prompt evolution telemetry

The engine mutates its prompt templates automatically whenever accuracy/compliance dip across recent runs. You can expose that signal via `get_evolution_stats`.

```typescript
import openreason, { get_evolution_stats } from "openreason";

// ...after running several queries
const evolution = get_evolution_stats();
console.log(evolution.evolution_count);
console.log(evolution.performance_history);
```

## snapshot the applied configuration

Use `get_config` to inspect the normalized config the engine is currently using. This is helpful when toggling providers or when you rely on defaults.

```typescript
import openreason, { get_config } from "openreason";

openreason.init({
  provider: "google",
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-1.5-pro",
  simpleModel: "gemini-1.5-flash",
  performance: { maxRetries: 4, timeout: 40000 },
});

console.log(get_config());
```

## switch providers at runtime

`openreason.init` can be called multiple times inside the same process. Swap providers to compare results or route different tenants to different vendors.

```typescript
const question = "outline a sustainable energy plan for a city";

openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
});
const openaiAnswer = await openreason.reason(question);

openreason.init({
  provider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
});
const claudeAnswer = await openreason.reason(question);

console.log({
  openai: openaiAnswer.confidence,
  claude: claudeAnswer.confidence,
});
```
