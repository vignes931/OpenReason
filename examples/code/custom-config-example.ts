import openreason from "openreason";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY before running the custom config examples.");
}

async function runWithConfig<T extends Parameters<typeof openreason.init>[0]>(label: string, config: T, query: string) {
    console.log(`\n=== ${label} ===`);
    openreason.init(config);
    const result = await openreason.reason(query);
    console.log({ verdict: result.verdict, confidence: result.confidence, mode: result.mode, latency: result.latency });
}

async function customConfigExamples() {
    await runWithConfig(
        "weighted confidence",
        {
            provider: "openai",
            apiKey,
            model: "gpt-4o",
            simpleModel: "gpt-4o-mini",
            weights: { logical: 0.6, rule: 0.3, empathy: 0.1 }
        },
        "prove that the square root of 2 is irrational"
    );

    await runWithConfig(
        "performance tuning",
        {
            provider: "openai",
            apiKey,
            model: "gpt-4o",
            performance: { maxRetries: 5, timeout: 60000 }
        },
        "outline a 5 step plan to land a spacecraft on mars"
    );

    await runWithConfig(
        "persistent memory",
        {
            provider: "openai",
            apiKey,
            model: "gpt-4o",
            memory: { enabled: true, path: "./data/custom-memory.db" }
        },
        "summarize the benefits of distributed systems"
    );

    await runWithConfig(
        "stateless run",
        {
            provider: "openai",
            apiKey,
            model: "gpt-4o",
            memory: { enabled: false, path: "./data/unused.db" }
        },
        "when should reflective reasoning be used"
    );
}

customConfigExamples().catch(console.error);
