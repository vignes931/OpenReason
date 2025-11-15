           │
    ┌──────┴──────┬──────────────┐
    │             │              │
    ▼             ▼              ▼

┌─────────┐ ┌─────────┐ ┌───────────┐
│EPISODIC │ │SEMANTIC │ │PROCEDURAL │
└─────────┘ └─────────┘ └───────────┘
│ │ │
│ │ │
specific general how-to
events patterns schemas
│ │ │
▼ ▼ ▼
┌─────────┐ ┌─────────┐ ┌───────────┐
│"2+2=4" │ │"math │ │"use det │
│conf:1.0 │ │queries │ │compute │
│ │ │are │ │for math" │
│ │ │simple" │ │ │
└─────────┘ └─────────┘ └───────────┘

Storage: SQLite via Keyv

- episodic_db: namespace "episodic"
- semantic_db: namespace "semantic"
- procedural_db: namespace "procedural"

Pattern Extraction:
episodic (N=50 recent) → semantic rules
semantic rules → procedural schemas

```

---

## Adaptive Learning Flow

```

┌────────────────────┐
│ reasoning_trace │
└─────────┬──────────┘
│
▼
┌────────────────────────────┐
│ log_trace() │
│ - query │
│ - complexity │
│ - mode_used │
│ - mode_recommended │
│ - pass/fail │
│ - efficiency │
└─────────┬──────────────────┘
│
▼
┌────────────────────────────┐
│ update_learning() │
│ │
│ calculate: │
│ - reflex_accuracy │
│ - analytic_accuracy │
│ - reflective_accuracy │
│ - overthinking_rate │
│ - underthinking_rate │
│ - optimal_thresholds │
└─────────┬──────────────────┘
│
▼
┌────────────────────────────┐
│ get_recommendations() │
│ │
│ if overthinking > 20%: │
│ → raise reflex thresh │
│ if underthinking > 20%: │
│ → lower analytic thresh │
│ if accuracy < 70%: │
│ → review constraints │
└────────────────────────────┘

```

---

## Error Handling Strategy

```

┌───────────────┐
│ kernel.run() │
└───────┬───────┘
│
├─ try {
│ safety_filter() ← can reject
│ context_assembler() ← can fail
│ rdc.route() ← robust
│ deterministic() ← can return null
│ build_prompt() ← can fail
│ invoke_llm() ← can timeout/error
│ validate_json() ← repairs if possible
│ run_constraints() ← logs violations
│ calc_conf() ← robust
│ store_memory() ← can fail silently
│ }
│
└─ catch (err) {
log_error(err)
return {
verdict: "error: " + err.message.slice(0,100),
conf: 0,
reasoning: "",
meta: {
error: true,
proc_time: timer.elapsed()
}
}
}

````

---

## Performance Characteristics

| Component        | Complexity | Latency | Notes                  |
| ---------------- | ---------- | ------- | ---------------------- |
| Safety Filter    | O(n)       | <1ms    | Pattern matching       |
| Context Assembly | O(n)       | <5ms    | Tone/intent detection  |
| RDC Routing      | O(n)       | <10ms   | Complexity calculation |
| Deterministic    | O(1)       | 0ms     | Instant math/facts     |
| Prompt Build     | O(m·n)     | <10ms   | m=perspectives         |
| LLM Call         | O(1)       | 1-10s   | Provider-dependent     |
| JSON Validation  | O(n)       | <5ms    | Parse/repair           |
| Constraints      | O(k·n)     | <50ms   | k=rules, n=text        |
| Confidence       | O(1)       | <1ms    | Weighted average       |
| Memory Store     | O(log n)   | <10ms   | SQLite insert          |
| Learning Update  | O(n)       | <100ms  | Stats calculation      |

**Total Pipeline**: O(n) dominated by LLM latency (1-10s)

---

## Database Schema (Keyv Namespaces)

```sql
-- Episodic Memory (namespace: "episodic")
key: "ep_${timestamp}"
value: {
  timestamp: number
  query: string
  verdict: string
  confidence: number
  patterns: object
}

-- Semantic Memory (namespace: "semantic")
key: "sem_${pattern}"
value: {
  pattern: string
  abstraction: string
  frequency: number
  success_rate: number
}

-- Procedural Memory (namespace: "procedural")
key: "proc_${name}"
value: {
  name: string
  template: string
  avg_confidence: number
  use_count: number
}

-- Prompts (namespace: "prompts")
key: "${prompt_id}"
value: {
  id: string
  title: string
  system: string
  score: number
  usage_count: number
  avg_conf: number
}

-- Performance (namespace: "perf")
key: "${prompt_id}_${timestamp}"
value: {
  id: string
  conf: number
  proc_time: number
  compliance: number
  coherence: number
  ts: number
}
````

---

## Configuration Hierarchy

```
1. Environment Variables (.env)
   ↓
2. Config Loader (utils/config.ts)
   ↓
3. Runtime Configuration
   ├─ models (simple/moderate/complex)
   ├─ weights (logical/rule/empathy)
   ├─ persp_weights (by domain)
   ├─ memory (enabled/path/thresholds)
   └─ perf (retries/timeout/caching)
   ↓
4. Component Initialization
   ├─ kernel (uses cfg.models, cfg.weights)
   ├─ memory (uses cfg.memory)
   └─ llm_driver (uses cfg.perf)
```

---

## Future Architecture

### Parallel Reasoning Engine (Planned)

```
┌─────────────────┐
│  query          │
└────────┬────────┘
         │
         ├──→ [logical perspective]    ─┐
         ├──→ [causal perspective]     ─┤
         ├──→ [analytical perspective] ─┼─→ parallel llm calls
         ├──→ [creative perspective]   ─┤
         ├──→ [empathetic perspective] ─┤
         └──→ [ethical perspective]    ─┘
                │
                ▼
         fusion_engine
                │
                ├─→ calc_coherence
                ├─→ calc_uncertainty
                └─→ weighted_fusion
                      │
                      ▼
              consensus_output
```

---

**lowercase visual clarity. architecture at a glance.**
