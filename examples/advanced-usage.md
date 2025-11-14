# advanced usage

## hierarchical memory system

three-tier memory: episodic (experiences), semantic (patterns), procedural (schemas)

```typescript
import { hierarchical_memory } from "openreason";

const memory = new hierarchical_memory();

// store episodic memory (specific reasoning trace)
await memory.store_episodic({
  timestamp: Date.now(),
  query: "what is recursion?",
  verdict: "a function that calls itself",
  confidence: 0.95,
  patterns: { domain: "programming", complexity: 0.3 },
});

// retrieve episodic memories
const episodes = await memory.load_episodic({ limit: 10 });

// load semantic patterns (abstractions learned from episodes)
const patterns = await memory.load_semantic();

// load procedural schemas (how-to knowledge)
const schemas = await memory.load_procedural();
```

## adaptive learning system

learns optimal complexity thresholds and tracks performance:

```typescript
import { adaptive_learner } from "openreason";

const learner = new adaptive_learner();

// log reasoning trace
learner.log_trace({
  query: "complex math problem",
  complexity_score: 0.3,
  mode_used: "analytic",
  mode_recommended: "reflex",
  pass: true,
  efficiency_score: 0.85,
  timestamp: Date.now(),
});

// update learning statistics
const stats = learner.update_learning();
console.log(stats.reflex_accuracy); // accuracy by mode
console.log(stats.analytic_accuracy);
console.log(stats.reflective_accuracy);
console.log(stats.recommended_thresholds); // learned thresholds

// get recommendations for threshold adjustments
const recs = learner.get_recommendations();
if (recs.overthinkin_rate > 0.2) {
  console.log("consider raising reflex threshold");
}
```

## direct access to reasoning components

```typescript
import {
  kernel,
  score_complexity,
  deterministic_compute,
  invoke_llm,
} from "openreason";

// calculate complexity score
const complexity = score_complexity("your query");
console.log(complexity); // 0.0 - 1.0

// try deterministic compute
const dc = new deterministic_compute();
const result = dc.try_compute("15 * 23");
console.log(result); // "345" or null

// use kernel directly
const k = new kernel();
const response = await k.run("your query");
```

## custom configuration programmatically

```typescript
import { adaptive_reasoning_throttle, load_cfg } from "openreason";

// load base config
const cfg = load_cfg();

// modify configuration
cfg.models.simple.model = "gpt-4o-mini";
cfg.models.moderate.model = "gpt-4o";
cfg.models.complex.provider = "anthropic";
cfg.models.complex.model = "claude-3-5-sonnet-20241022";

// adjust weights
cfg.weights.logical = 0.5;
cfg.weights.rule = 0.3;
cfg.weights.empathy = 0.2;

// disable memory for stateless operation
cfg.memory.enabled = false;

// use custom config
const art = new adaptive_reasoning_throttle();
const result = await art.reason("your query");
```
