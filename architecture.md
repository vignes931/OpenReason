# OpenReason Architecture

**open reasoning system design**

---

## System Overview

OpenReason is a **cognitive reasoning system** that combines:

- adaptive reasoning depth control
- constitutional constraint enforcement
- hierarchical memory
- self-improving prompts
- multi-provider LLM integration

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         USER QUERY                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SAFETY FILTER                            │
│         blocks harmful/illegal/personal requests            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONTEXT ASSEMBLER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ tone_detector│  │ intent_mapper│  │empathy_weight│     │
│  │analytical    │  │  inform      │  │   0.0-1.0    │     │
│  │empathetic    │  │  analyze     │  │              │     │
│  │assertive     │  │  justify     │  │              │     │
│  │curious       │  │  reflect     │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                            ▼                                │
│                     context_frame                           │
│            {tone, intent, empathy_w, safe}                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            REASONING DEPTH CONTROLLER (RDC)                 │
│                                                             │
│  1. classify_domain(query)  → math|logic|ethics|...        │
│  2. score_complexity(query) → 0.0-1.0                      │
│  3. select_mode(complexity) → reflex|analytic|reflective   │
│  4. load_constraints(domain) → rules + budgets             │
│                                                             │
│  Complexity Calculation:                                    │
│  ├─ keyword_score * 0.4   (abstract|complex|nuanced)       │
│  ├─ structure_score * 0.3 (questions, comparisons)         │
│  └─ domain_score * 0.3    (ethics=high, math=low)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              DETERMINISTIC COMPUTE CHECK                    │
│                                                             │
│  if (mode === "reflex" && deterministic) {                 │
│    try_deterministic() → instant answer                    │
│    return { answer, confidence: 1.0, time: 0ms }           │
│  }                                                          │
│                                                             │
│  Handles:                                                   │
│  - arithmetic (+, -, *, /, ^, sqrt)                        │
│  - scientific constants (c, pi, e, etc.)                   │
│  - fact lookups (speed of light, boiling point, etc.)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PROMPT BUILDER                            │
│                                                             │
│  select_system_prompt() from blueprint_bank                 │
│  ├─ load best performing prompt                            │
│  └─ or use default reasoning template                      │
│                                                             │
│  build_prompt() {                                           │
│    system: constitutional_rules + reasoning_structure       │
│    user: query + context_frame + constraints               │
│  }                                                          │
│                                                             │
│  Constitutional Rules (always included):                    │
│  1. no contradictions                                       │
│  2. evidence required                                       │
│  3. calibrated confidence                                   │
│  4. no circular reasoning                                   │
│  5. concise output                                          │
│  6. empathy alignment                                       │
│  7. no manipulation                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     LLM DRIVER                              │
│                                                             │
│  model_selection() {                                        │
│    reflex    → simple_model   (gpt-4o-mini)                │
│    analytic  → moderate_model (gpt-4o)                     │
│    reflective→ complex_model  (gpt-4o)                     │
│  }                                                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  OpenAI  │  │Anthropic │  │  Google  │  │   XAI    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └─────────────┴─────────────┴──────────────┘         │
│                      │                                      │
│         invoke_llm() with retries (3x)                     │
│         exponential backoff: 1s, 2s, 3s                    │
│                      │                                      │
│                      ▼                                      │
│              raw_llm_response                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 RESPONSE VALIDATOR                          │
│                                                             │
│  validate_json(raw_response) {                             │
│    try: parse JSON                                          │
│    catch: extract with regex + repair                      │
│  }                                                          │
│                                                             │
│  ensure_fields(parsed) {                                    │
│    verdict:    string (required)                            │
│    confidence: number [0,1] (default: 0.5)                 │
│    reasoning:  string (optional)                            │
│    perspectives: object (optional)                          │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONSTRAINT ENGINE                           │
│                                                             │
│  run_constraints(input, output) {                          │
│    for each rule in constitutional_rules:                   │
│      check_compliance(query, verdict, rule)                │
│      if violated → violations.push(rule)                   │
│  }                                                          │
│                                                             │
│  compliance_result = {                                      │
│    ratio: 1 - (violations / total_rules)                   │
│    violations: [violated_rules]                             │
│    metadata: {rule_details}                                 │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               CONFIDENCE CALCULATION                        │
│                                                             │
│  calc_conf(logical, compliance, empathy, weights) {        │
│    lc = logical_coherence      (from LLM)                  │
│    rc = rule_compliance        (from constraint_engine)    │
│    ec = empathy_alignment      (from context_frame)        │
│                                                             │
│    lw = weights.logical        (default: 0.4)              │
│    rw = weights.rule           (default: 0.4)              │
│    ew = weights.empathy        (default: 0.2)              │
│                                                             │
│    conf = (lw * lc) + (rw * rc) + (ew * ec)               │
│    return clamp(conf, 0, 1)                                │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                HIERARCHICAL MEMORY                          │
│                                                             │
│  store_episodic() {                                         │
│    entry = {query, verdict, confidence, patterns}          │
│    episodic_db.set(`ep_${timestamp}`, entry)               │
│    extract_patterns(episodes)  → semantic memory           │
│  }                                                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │  Episodic       │  │   Semantic      │  │ Procedural │ │
│  │  (traces)       │─→│   (patterns)    │─→│ (schemas)  │ │
│  │                 │  │                 │  │            │ │
│  │ what happened   │  │ general rules   │  │ how to do  │ │
│  └─────────────────┘  └─────────────────┘  └────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ADAPTIVE LEARNER                           │
│                                                             │
│  log_trace() {                                              │
│    depth_trace = {                                          │
│      query, complexity, mode_used, mode_recommended,       │
│      pass, score, efficiency, timestamp                     │
│    }                                                        │
│    save to depth_traces.json                               │
│  }                                                          │
│                                                             │
│  update_learning() {                                        │
│    calculate_optimal_threshold(reflex_traces)              │
│    calculate_optimal_threshold(analytic_traces)            │
│    track_accuracy_per_mode()                               │
│    detect_overthinking()                                    │
│    detect_underthinking()                                   │
│    save to learning_stats.json                             │
│  }                                                          │
│                                                             │
│  get_recommendations() {                                    │
│    if overthinking_rate > 0.2:                             │
│      suggest raise reflex threshold                         │
│    if underthinking_rate > 0.2:                            │
│      suggest lower analytic threshold                       │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                OPENREASON RESPONSE                         │
│                                                             │
│  {                                                          │
│    verdict: string           // main answer                │
│    conf: number             // confidence [0,1]            │
│    reasoning: string        // trace                       │
│    meta: {                                                  │
│      mode: "reflex" | "analytic" | "reflective"           │
│      domain: string                                         │
│      complexity: number                                     │
│      compliance: {ratio, violations}                        │
│      model: string                                          │
│      proc_time: number                                      │
│      deterministic: boolean                                 │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Dependencies

```
adaptive_reasoning_throttle (ART)
  │
  ├─→ sentience_filter
  │     └─ safety check
  │
  ├─→ context_assembler
  │     ├─ tone_detector
  │     ├─ intent_mapper
  │     └─ empathy_calculator
  │
  ├─→ reasoning_depth_controller (RDC)
  │     ├─ classify_domain()
  │     ├─ score_complexity()
  │     └─ load_constraints()
  │
  ├─→ deterministic_compute
  │     ├─ arithmetic_ops
  │     └─ fact_lookups
  │
  ├─→ kernel
  │     ├─ blueprint_bank
  │     │   └─ best_prompt_selection
  │     │
  │     ├─ prompt_builder
  │     │   ├─ constraint_matrix
  │     │   └─ perspective_builder
  │     │
  │     ├─ llm_driver
  │     │   ├─ openai_client
  │     │   ├─ anthropic_client
  │     │   ├─ google_client
  │     │   └─ xai_client
  │     │
  │     ├─ response_validator
  │     │   ├─ json_parser
  │     │   └─ field_normalizer
  │     │
  │     └─ constraint_engine
  │         └─ compliance_checker
  │
  ├─→ hierarchical_memory
  │     ├─ episodic_memory (keyv)
  │     ├─ semantic_memory (keyv)
  │     └─ procedural_memory (keyv)
  │
  └─→ adaptive_learner
        ├─ trace_logger
        ├─ stats_calculator
        └─ threshold_optimizer
```

---

## Mode Selection Logic

```
┌─────────────────────┐
│ complexity_score    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
< 0.25         ≥ 0.25
    │             │
    ▼             ▼
┌────────┐   ┌─────────────┐
│ REFLEX │   │  < 0.65 ?   │
│        │   └──────┬───────┘
│ • 0ms  │          │
│ • det  │    ┌─────┴─────┐
│ • 512t │    │           │
└────────┘   YES          NO
             │           │
             ▼           ▼
       ┌──────────┐  ┌──────────┐
       │ ANALYTIC │  │REFLECTIVE│
       │          │  │          │
       │ • 1-3s   │  │ • 3-10s  │
       │ • struct │  │ • deep   │
       │ • 2048t  │  │ • 8192t  │
       └──────────┘  └──────────┘
```

---

## Constraint Checking Flow

```
┌─────────────────────┐
│ query + llm_output  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  constraint_matrix      │
│  loads domain rules     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  constraint_engine                  │
│                                     │
│  for each rule:                     │
│    if "no_contradiction":           │
│      check_for_contradictions()     │
│    if "evidence_required":          │
│      verify_evidence_present()      │
│    if "calibrated_confidence":      │
│      validate_confidence_match()    │
│    ...                              │
│                                     │
│  violations = failed_checks         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│  compliance_result      │
│                         │
│  ratio = 1 - (v / n)    │
│  violations = [...]     │
└─────────────────────────┘
```

---

## Memory Architecture

```
┌──────────────────────────────────────────┐
│            HIERARCHICAL MEMORY           │
└──────────────────────────────────────────┘
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
    ▼             ▼              ▼
┌─────────┐  ┌─────────┐  ┌───────────┐
│EPISODIC │  │SEMANTIC │  │PROCEDURAL │
└─────────┘  └─────────┘  └───────────┘
    │            │              │
    │            │              │
specific     general        how-to
events       patterns       schemas
    │            │              │
    ▼            ▼              ▼
┌─────────┐  ┌─────────┐  ┌───────────┐
│"2+2=4"  │  │"math    │  │"use det   │
│conf:1.0 │  │queries  │  │compute    │
│         │  │are      │  │for math"  │
│         │  │simple"  │  │           │
└─────────┘  └─────────┘  └───────────┘

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
│  reasoning_trace   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────┐
│  log_trace()               │
│  - query                   │
│  - complexity              │
│  - mode_used               │
│  - mode_recommended        │
│  - pass/fail               │
│  - efficiency              │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│  update_learning()         │
│                            │
│  calculate:                │
│  - reflex_accuracy         │
│  - analytic_accuracy       │
│  - reflective_accuracy     │
│  - overthinking_rate       │
│  - underthinking_rate      │
│  - optimal_thresholds      │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│  get_recommendations()     │
│                            │
│  if overthinking > 20%:    │
│    → raise reflex thresh   │
│  if underthinking > 20%:   │
│    → lower analytic thresh │
│  if accuracy < 70%:        │
│    → review constraints    │
└────────────────────────────┘
```

---

## Error Handling Strategy

```
┌───────────────┐
│ kernel.run()  │
└───────┬───────┘
        │
        ├─ try {
        │   safety_filter()     ← can reject
        │   context_assembler() ← can fail
        │   rdc.route()         ← robust
        │   deterministic()     ← can return null
        │   build_prompt()      ← can fail
        │   invoke_llm()        ← can timeout/error
        │   validate_json()     ← repairs if possible
        │   run_constraints()   ← logs violations
        │   calc_conf()         ← robust
        │   store_memory()      ← can fail silently
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
```

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
```

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
