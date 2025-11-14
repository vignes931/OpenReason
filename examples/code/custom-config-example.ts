import openreason from "openreason";
import { adaptive_reasoning_throttle, load_cfg } from "openreason";

async function customConfigExamples() {
    // example 1: adjust confidence weights
    console.log("\n=== custom weights example ===");
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
        weights: {
            logical: 0.6, // prioritize logical coherence
            rule: 0.3, // moderate rule compliance
            empathy: 0.1, // minimal empathy weight
        },
    });

    const logical = await openreason.reason(
        "prove that the square root of 2 is irrational"
    );
    console.log("logical query result:", logical.verdict);
    console.log("confidence:", logical.confidence);

    // example 2: performance tuning
    console.log("\n=== performance tuning example ===");
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
        performance: {
            maxRetries: 5, // more retries for reliability
            timeout: 60000, // 60 second timeout
            caching: true, // enable caching
        },
    });

    const perf = await openreason.reason("complex query that might timeout");
    console.log("result:", perf.verdict);

    // example 3: memory configuration
    console.log("\n=== memory configuration example ===");
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
        memory: {
            enabled: true,
            path: "./data/custom-memory.db",
            blueprintThresh: 0.9, // higher threshold for prompt evolution
            evolInterval: 25, // evolve more frequently
        },
    });

    const mem = await openreason.reason("query with memory enabled");
    console.log("memory result:", mem.verdict);

    // example 4: stateless configuration (no memory)
    console.log("\n=== stateless configuration example ===");
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
        memory: { enabled: false },
    });

    const stateless = await openreason.reason("stateless query");
    console.log("stateless result:", stateless.verdict);

    // example 5: direct config manipulation
    console.log("\n=== direct config manipulation example ===");
    const cfg = load_cfg();

    // customize models
    cfg.models.simple.model = "gpt-4o-mini";
    cfg.models.moderate.model = "gpt-4o";
    cfg.models.complex.provider = "anthropic";
    cfg.models.complex.model = "claude-3-5-sonnet-20241022";

    // adjust routing thresholds
    cfg.routing.reflex_threshold = 0.2; // lower threshold for reflex
    cfg.routing.analytic_threshold = 0.7; // higher threshold for analytic

    // modify weights
    cfg.weights.logical = 0.5;
    cfg.weights.rule = 0.4;
    cfg.weights.empathy = 0.1;

    // use custom config
    const art = new adaptive_reasoning_throttle();
    const custom = await art.reason("query with custom config");
    console.log("custom config result:", custom.verdict);
    console.log("mode used:", custom.mode);

    // example 6: mixed provider strategy
    console.log("\n=== mixed provider strategy example ===");
    const mixedCfg = load_cfg();
    mixedCfg.models.simple.provider = "openai";
    mixedCfg.models.simple.model = "gpt-4o-mini"; // fast for simple queries
    mixedCfg.models.moderate.provider = "anthropic";
    mixedCfg.models.moderate.model = "claude-3-5-sonnet-20241022"; // quality for moderate
    mixedCfg.models.complex.provider = "anthropic";
    mixedCfg.models.complex.model = "claude-3-5-sonnet-20241022"; // best for complex

    const mixed = new adaptive_reasoning_throttle();
    const result = await mixed.reason("moderate complexity query");
    console.log("mixed strategy result:", result.verdict);
    console.log("provider used:", result.provider_used);
}

// run examples
customConfigExamples().catch(console.error);
