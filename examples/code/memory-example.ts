import openreason, { get_memory_stats } from "openreason";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY before running the memory example.");
}

openreason.init({
    provider: "openai",
    apiKey,
    model: "gpt-4o",
    memory: { enabled: true, path: "./data/memory-example.db" }
});

async function memoryExamples() {
    console.log("\n=== first run ===");
    const first = await openreason.reason("what is photosynthesis?");
    console.log({ verdict: first.verdict, confidence: first.confidence, metadata: first.metadata });

    console.log("\n=== repeated query (should hit cache) ===");
    const second = await openreason.reason("what is photosynthesis?");
    console.log({ verdict: second.verdict, cached: second.metadata?.cached, cacheSimilarity: second.metadata?.cacheSimilarity });

    console.log("\n=== similar query ===");
    const third = await openreason.reason("explain plant energy production");
    console.log({ verdict: third.verdict, mode: third.mode, metadata: third.metadata });

    console.log("\n=== memory stats ===");
    console.log(get_memory_stats());
}

memoryExamples().catch(console.error);
