# configuration examples

## full configuration options

```typescript
openreason.init({
  // required
  provider: "openai", // openai | anthropic | google | xai
  apiKey: "sk-...", // your api key
  model: "gpt-4o", // main model for analytic mode

  // optional models
  simpleModel: "gpt-4o-mini", // for reflex mode (simple queries)
  complexModel: "gpt-4o", // for reflective mode (complex queries)

  // confidence weights (optional)
  weights: {
    logical: 0.4, // logical coherence weight
    rule: 0.4, // constitutional rule compliance
    empathy: 0.2, // empathy alignment
  },

  // memory system (optional)
  memory: {
    enabled: true, // enable hierarchical memory
    path: "./data/memory.db", // sqlite database path
    blueprintThresh: 0.85, // prompt performance threshold
    evolInterval: 100, // evolve prompts every N queries
  },

  // performance tuning (optional)
  performance: {
    maxRetries: 3, // max llm retry attempts
    timeout: 30000, // request timeout in milliseconds
    caching: true, // enable response caching
  },
});
```

## provider examples

### openai

```typescript
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
  simpleModel: "gpt-4o-mini",
});
```

### anthropic

```typescript
openreason.init({
  provider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-3-5-sonnet-20241022",
  simpleModel: "claude-3-5-haiku-20241022",
});
```

### google

```typescript
openreason.init({
  provider: "google",
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-pro",
  simpleModel: "gemini-1.5-flash",
});
```

### xai

```typescript
openreason.init({
  provider: "xai",
  apiKey: process.env.XAI_API_KEY,
  model: "grok-beta",
});
```

## environment variables

```bash
# required
PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENREASON_MODERATE_MODEL=gpt-4o

# optional models
OPENREASON_SIMPLE_MODEL=gpt-4o-mini
OPENREASON_COMPLEX_MODEL=gpt-4o

# optional weights
OPENREASON_WEIGHT_LOGICAL=0.4
OPENREASON_WEIGHT_RULE=0.4
OPENREASON_WEIGHT_EMPATHY=0.2

# optional memory
OPENREASON_MEMORY_ENABLED=true
OPENREASON_MEMORY_PATH=./data/memory.db
OPENREASON_BLUEPRINT_THRESH=0.85
OPENREASON_EVOL_INTERVAL=100

# optional performance
OPENREASON_MAX_RETRIES=3
OPENREASON_TIMEOUT=30000
OPENREASON_CACHING=true
```

load from environment:

```typescript
import { load_cfg } from "openreason";
const cfg = load_cfg();
```
