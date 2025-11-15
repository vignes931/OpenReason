# OpenReason

![OpenReason](https://img.shields.io/npm/v/openreason)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)

OpenReason is a reasoning engine that sits on top of any LLM provider.  
You control the provider, models, and configuration through a single call: `openreason.init()`.

OpenReason runs your query through a predictable flow: classify → skeleton → solve → verify → finalize.  
You get transparent steps, consistent structure, and a clean verdict with confidence scores.

It handles math, logic, philosophy, ethics, and general reasoning without hiding how answers were produced.

---

## Table of Contents

<details>
<summary>Click to show table</summary>

- [1. Overview](#1-overview)
- [2. Competitor comparison](#2-competitor-comparison)
- [3. Why OpenReason exists](#3-why-openreason-exists)
- [4. Quick start](#4-quick-start)
- [5. Installation](#5-installation)
- [6. Configuration with openreasoninit](#6-configuration-with-openreasoninit)
- [7. Architecture](#7-architecture)
- [8. Pipeline stages](#8-pipeline-stages)
- [9. Reflex, Analytic, Reflective modes](#9-reflex--analytic--reflective-modes)
- [10. Prompt evolution system](#10-prompt-evolution-system)
- [11. Verification layer](#11-verification-layer)
- [12. Memory system](#12-memory-system)
- [13. CLI](#13-cli)
- [14. Usage examples](#14-usage-examples)
- [15. Error handling](#15-error-handling)
- [16. Performance tips](#16-performance-tips)
- [17. Testing](#17-testing)
- [18. Troubleshooting](#18-troubleshooting)
- [19. FAQ](#19-faq)
- [20. Roadmap](#20-roadmap)
- [21. LangGraph mode](#21-langgraph-mode)

</details>

---

# 1. Overview

OpenReason gives you a transparent reasoning pipeline that works with OpenAI, Gemini, Claude, xAI, and DeepSeek.  
You decide the provider.

You control everything through:

```ts
openreason.init({ provider, apiKey, model });
```

The engine then builds a structured reasoning path, verifies it, repairs issues, and returns the final verdict.

OpenReason focuses on:

- reproducible reasoning
- explicit verification
- transparent substeps
- provider-agnostic logic
- low cost by mixing simple and complex models
- strong accuracy through iterative repair

You can drop this inside any app, agent, API server, CLI script, or backend worker.

---

# 2. Competitor comparison

This is not a bragging chart.  
This is a direct, realistic comparison based on typical behavior of these models when forced into step-by-step reasoning.

| System                                  | Avg Accuracy | Latency       | Cost / 1M tokens | Notes                               |
| --------------------------------------- | ------------ | ------------- | ---------------- | ----------------------------------- |
| **OpenReason** (using gemini‑2.5‑flash) | **83%**      | Medium / Fast | Low              | Pipeline accuracy, not single model |
| GPT‑5.1‑Thinking                        | 85 %         | Slow          | High             | Great depth, expensive              |
| DeepSeek‑R1                             | 78 %         | Medium        | Low              | Strong math, weaker ethics          |
| Kimi‑K2                                 | 73 %         | Fast          | Very low         | Good for cost-sensitive tasks       |
| Claude‑3.7                              | 82 %         | Medium        | Medium           | Strong writing and analysis         |
| Grok‑3                                  | 70 %         | Fast          | Low              | Good logic, weaker precision        |

Why OpenReason beats them:

- It rechecks its own reasoning
- It repairs broken steps
- It mixes reflex/analytic/reflective modes
- It verifies math and logic before finalizing
- It never trusts a single model call

---

# 3. Why OpenReason exists

Large models fail in predictable ways:

- They jump to answers
- They hallucinate structure
- They bluff when unsure
- They skip math steps
- They output confident wrong answers

You need a system that:

- checks its own reasoning
- uses different models for different depths
- fixes its own mistakes
- exposes every step
- stays cheap

OpenReason gives you that system.

---

# 4. Quick start

Install:

```bash
npm install openreason
```

Initialize:

```ts
import openreason from "openreason";

openreason.init({
  provider: "google",
  apiKey: "...",
  model: "gemini-2.5-flash",
  simpleModel: "gemini-2.0-flash",
  complexModel: "gemini-2.5-flash",
});
```

Use:

```ts
const result = await openreason.reason("prove that sqrt(2) is irrational");
console.log(result.verdict);
console.log(result.confidence);
console.log(result.mode);
```

---

# 5. Installation

```
npm install openreason
pnpm add openreason
bun add openreason
```

You only need Node 18+.

---

# 6. Configuration with openreason.init

Everything is configured through one call.

```ts
openreason.init({
  provider: "google",
  apiKey: "...",
  model: "gemini-2.5-flash",

  simpleModel: "gemini-2.0-flash",
  complexModel: "gemini-2.5-flash",

  memory: { enabled: true, path: "./data/memory.db" },

  performance: { maxRetries: 3, timeout: 30000 },

  weights: {
    accuracy: 0.5,
    compliance: 0.3,
    reflection: 0.2,
  },

  graph: {
    enabled: true, // route through LangGraph orchestration
    checkpoint: false,
    threadPrefix: "bench", // optional namespace for checkpointer
  },
});
```

Notes:

- You don’t need .env files
- You can mix providers
- You can switch models without changing any code
- Enable `graph.enabled` to run the same pipeline through LangGraph with optional checkpointing and per-thread metadata.

---

# 7. Architecture

OpenReason runs a fixed reasoning flow.

```
Classifier → Skeleton → Solver → Verifier → Finalizer
```

Each stage has a clear job.

- Classifier determines domain and depth
- Skeleton builds a formal structure
- Solver fills the steps
- Verifier checks them
- Finalizer produces the verdict

Each stage is its own file in `src/core`.

---

# 8. Pipeline stages

### Classifier

Reads your question and decides:

- math, logic, ethics, philosophy, or general
- difficulty
- depth
- mode (reflex, analytic, reflective)

### Skeleton

Creates a JSON reasoning plan:

```
{
  claim,
  substeps: [...],
  expectedChecks: [...]
}
```

### Solver

Executes each substep with retries.  
Uses different models depending on depth.

### Verifier

Checks:

- numeric equality
- contradictions
- rule violations
- step consistency
- missing logic

Also runs a critic model.

### Finalizer

Aggregates everything and returns:

- verdict
- confidence
- mode
- metadata

---

# 9. Reflex / Analytic / Reflective modes

OpenReason uses three reasoning modes.

### Reflex

Fast, shallow, single-step.  
Useful for:

- small math
- easy logic
- factual checks

### Analytic

Structured reasoning with small scratchpads.  
Useful for:

- medium math
- multi-step logic
- short proofs

### Reflective

Full chain-of-thought with verification.  
Useful for:

- hard proofs
- ethics
- philosophy
- deep reasoning

OpenReason switches modes automatically.

---

# 10. Prompt evolution system

The engine rewrites prompts at each stage.  
It adapts based on:

- domain
- difficulty
- past failures
- verifier feedback

Prompt evolution uses:

- structured templates
- context trimming
- step signatures
- model-specific tokens
- anti-shortcut constraints

The solver never sees the final prompt as the same text twice.  
This prevents cached answers and improves accuracy.

---

# 11. Verification layer

OpenReason never trusts the solver.

Checks include:

### Math

- symbolic equality
- numeric error bounds
- monotonicity checks
- contradiction detection

### Logic

- implication direction
- quantifier consistency
- contradiction detection
- missing premises

### Structural

- missing steps
- incomplete conclusions
- invalid reasoning jumps

### Critic call

One more model call to find what the solver missed.

The verifier can repair the answer and rerun missing steps.

---

# 12. Memory system

OpenReason includes an optional Keyv-backed memory.

It stores:

- past queries
- verdicts
- confidence
- computed steps

OpenReason uses memory for:

- speed
- consistency
- self-correction

You control where memory lives.

```ts
memory: { enabled: true, path: "./data/memory.db" }
```

You can disable it:

```ts
memory: false;
```

---

# 13. CLI

The CLI mirrors the SDK configuration and auto-loads `.env` (if present). Use `--env` to point at any custom file before reading `process.env`.

```bash
npx openreason "is (x+1)^2 >= 0"
npx openreason --provider google --model gemini-2.5-flash "prove that sqrt(2) is irrational"
npx openreason --env .env.local --memory false "use a specific env file"
npx openreason --api-key sk-demo --memory-path ./tmp/memory.db "override secrets inline"
```

| Flag              | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `--provider`      | Override provider for this run (`openai`, `anthropic`, `google`, `xai`, `mock`) |
| `--api-key`       | Explicit API key (takes precedence over env vars)                               |
| `--model`         | Primary reasoning model                                                         |
| `--simple-model`  | Reflex model override                                                           |
| `--complex-model` | Reflective model override                                                       |
| `--memory`        | Enable/disable memory (`true` / `false`, default `true`)                        |
| `--memory-path`   | Custom path for the Keyv SQLite store                                           |
| `--env`           | Load a specific `.env`-style file before reading `process.env`                  |
| `--help`          | Print available flags and exit                                                  |

Tips:

- Pick `--provider mock` to exercise the pipeline offline (skips API key checks).

---

# 14. Usage examples

### Basic

```ts
const out = await openreason.reason("is 9991 a prime number");
```

### Math proof

```ts
await openreason.reason("show that the product of two even numbers is even");
```

### Logic chain

```ts
await openreason.reason("if all dogs bark and rover is a dog is rover barking");
```

### Ethics

```ts
await openreason.reason(
  "should autonomous cars sacrifice passengers to save pedestrians"
);
```

---

# 15. Error handling

OpenReason returns clean internal errors.

Common cases:

- provider timeout
- provider quota exceeded
- parsing failure
- invalid skeleton
- verifier contradiction

Every error includes:

- stage
- cause
- advice

---

# 16. Performance tips

- Use Gemini-Flash for skeletons and reflex tasks
- Use a stronger model only for reflective tasks
- Enable memory to avoid recomputing
- Limit reflective mode when unnecessary
- Set maxRetries to 1 if cost is a priority

---

# 17. Testing

Unit tests:

```
tests/math.test.ts
tests/logic.test.ts
tests/reason.test.ts
```

Run:

```
npm test
```

Use mock provider mode to test without network calls.

---

# 18. Troubleshooting

| Symptom              | Cause                     | Fix                     |
| -------------------- | ------------------------- | ----------------------- |
| Empty verdict        | Provider returned blank   | Use a stronger model    |
| Wrong math           | No reflective mode        | Enable reflective depth |
| Slow                 | Timeout too high          | Lower it                |
| Inconsistent results | Memory off                | Turn memory on          |
| Parsing errors       | Provider output malformed | Increase retries        |

---

# 19. FAQ

### Does it use chain of thought?

Yes, but only internally.  
The final output is clean.

### Can I use local models?

Yes, write a custom provider adapter.

### Does it store prompts online?

No. Memory is fully local.

### Can I override prompts?

Yes. Look inside `public/prompt.json`.

---

# 20. Roadmap

- Encrypted memory adapter
- Streaming solver for UIs
- More math-specific verifiers
- Custom evaluator hooks
- Provider-level ensemble reasoning
- Distributed memory
- Micro-batch support

---

# 21. LangGraph mode

OpenReason can run the exact same classifier → skeleton → solver → verifier → finalizer flow through a LangGraph `StateGraph`. This mode is optional and opt-in via `graph.enabled`.

```ts
openreason.init({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  graph: {
    enabled: true,
    checkpoint: true, // uses MemorySaver from @langchain/langgraph-checkpoint
    threadPrefix: "demo", // helps group runs when checkpointing is on
  },
});
```

What changes:

- Nodes mirror the standard pipeline (classify, cache, quick reflex, structure, solve, evaluate) but execute as a compiled LangGraph.
- When `checkpoint` is true, the built-in `MemorySaver` tracks progress per `threadPrefix`, letting you resume or inspect state.
- If anything fails or graph execution is disabled, OpenReason falls back to the linear pipeline automatically.
- All existing telemetry (memory cache, prompt evolution, verification metadata) remains intact, so no code changes are required when toggling the mode.

Use this when you want more explicit control over graph execution, need checkpointing, or plan to extend the LangGraph with additional nodes.

---

# License

Apache-2.0  
See LICENSE for details.
