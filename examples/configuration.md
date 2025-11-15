# configuration examples

## full configuration surface

```typescript
openreason.init({
  provider: "openai", // openai | anthropic | google | xai | mock
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",

  // optional model routing
  simpleModel: "gpt-4o-mini",
  complexModel: "gpt-4o",

  // scoring weights (defaults: logical 0.4, rule 0.4, empathy 0.2)
  weights: {
    logical: 0.5,
    rule: 0.3,
    empathy: 0.2,
  },

  // memory cache (off by default)
  memory: {
    enabled: true,
    path: "./data/memory.db",
  },

  // retry policy
  performance: {
    maxRetries: 4,
    timeout: 45000,
  },
});
```

## provider presets

```typescript
// openai
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  simpleModel: "gpt-4o-mini",
});

// anthropic
openreason.init({
  provider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-sonnet-20241022",
  simpleModel: "claude-3-5-haiku-20241022",
});

// google (gemini)
openreason.init({
  provider: "google",
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-1.5-pro",
  simpleModel: "gemini-1.5-flash",
});

// xai
openreason.init({
  provider: "xai",
  apiKey: process.env.XAI_API_KEY!,
  model: "grok-beta",
});
```

## environment variable helpers

The CLI already loads `.env` files, so the easiest flow is to set keys there.

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=ya29....
OPENREASON_MODEL=gpt-4o
OPENREASON_SIMPLE_MODEL=gpt-4o-mini
OPENREASON_COMPLEX_MODEL=gpt-4o
OPENREASON_MEMORY_PATH=./data/memory.db
```

Then hydrate your config with small wrappers:

```typescript
openreason.init({
  provider:
    (process.env.OPENREASON_PROVIDER as "openai" | "google") || "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: process.env.OPENREASON_MODEL || "gpt-4o",
  simpleModel: process.env.OPENREASON_SIMPLE_MODEL,
  complexModel: process.env.OPENREASON_COMPLEX_MODEL,
  memory: {
    enabled: process.env.OPENREASON_MEMORY_PATH !== undefined,
    path: process.env.OPENREASON_MEMORY_PATH || "./data/memory.db",
  },
});
```
