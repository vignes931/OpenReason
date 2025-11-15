import openreason, { get_evolution_stats } from "openreason";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY before running the learning example.");
}

openreason.init({
    provider: "openai",
    apiKey,
    model: "gpt-4o",
    simpleModel: "gpt-4o-mini",
    complexModel: "gpt-4o",
    memory: { enabled: true, path: "./data/learning-memory.db" }
});

type TraceSnapshot = {
    query: string
    mode: string
    confidence: number
    latency: number
};

async function learningExamples() {
    const traces: TraceSnapshot[] = [];
    const prompts = [
        "2 + 2",
        "explain gravity",
        "should ai have rights?",
        "capital of france",
        "compare capitalism vs socialism"
    ];

    for (const query of prompts) {
        const result = await openreason.reason(query);
        traces.push({ query, mode: result.mode, confidence: result.confidence, latency: result.latency });
        console.log(`query: ${query}`);
        console.log(`  mode: ${result.mode}`);
        console.log(`  confidence: ${result.confidence.toFixed(2)}`);
        console.log(`  latency: ${result.latency}ms`);
    }

    const avgLatency = traces.reduce((sum, t) => sum + t.latency, 0) / traces.length;
    const avgConfidence = traces.reduce((sum, t) => sum + t.confidence, 0) / traces.length;

    console.log("\naverage stats", { avgLatency, avgConfidence });

    const evolution = get_evolution_stats();
    console.log("\nprompt evolution telemetry", evolution);
}

learningExamples().catch(console.error);
