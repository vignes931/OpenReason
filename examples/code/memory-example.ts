import openreason from "openreason";
import { hierarchical_memory } from "openreason";

// initialize with memory enabled
openreason.init({
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    memory: {
        enabled: true,
        path: "./data/memory-example.db",
        blueprintThresh: 0.85,
        evolInterval: 50,
    },
});

async function memoryExamples() {
    const memory = new hierarchical_memory();

    // example 1: store and retrieve episodic memories
    console.log("\n=== episodic memory example ===");

    // store some reasoning traces
    await memory.store_episodic({
        timestamp: Date.now(),
        query: "what is 2+2?",
        verdict: "4",
        confidence: 1.0,
        patterns: { domain: "math", complexity: 0.1 },
    });

    await memory.store_episodic({
        timestamp: Date.now(),
        query: "explain photosynthesis",
        verdict:
            "process where plants convert light into chemical energy using chlorophyll",
        confidence: 0.92,
        patterns: { domain: "biology", complexity: 0.4 },
    });

    await memory.store_episodic({
        timestamp: Date.now(),
        query: "should we ban autonomous weapons?",
        verdict:
            "complex ethical issue requiring consideration of safety, accountability, and international law",
        confidence: 0.78,
        patterns: { domain: "ethics", complexity: 0.8 },
    });

    // retrieve recent episodes
    const episodes = await memory.load_episodic({ limit: 10 });
    console.log("stored episodes:", episodes.length);
    episodes.forEach((ep, i) => {
        console.log(`${i + 1}. ${ep.query} -> ${ep.verdict.substring(0, 50)}...`);
    });

    // example 2: semantic patterns (learned abstractions)
    console.log("\n=== semantic memory example ===");
    const patterns = await memory.load_semantic();
    console.log("learned patterns:", patterns);

    // example 3: procedural schemas (how-to knowledge)
    console.log("\n=== procedural memory example ===");
    const schemas = await memory.load_procedural();
    console.log("procedural schemas:", schemas);

    // example 4: reason with memory context
    console.log("\n=== reasoning with memory ===");
    const result1 = await openreason.reason("what is photosynthesis?");
    console.log("first query result:", result1.verdict);
    console.log("confidence:", result1.confidence);

    // ask similar question - should leverage memory
    const result2 = await openreason.reason("explain plant energy production");
    console.log("second query result:", result2.verdict);
    console.log("confidence:", result2.confidence);

    // example 5: memory statistics
    console.log("\n=== memory statistics ===");
    const stats = await memory.get_statistics();
    console.log("total episodes:", stats.episodic_count);
    console.log("semantic patterns:", stats.semantic_count);
    console.log("average confidence:", stats.avg_confidence);
    console.log("domains covered:", stats.domains);
}

// run examples
memoryExamples().catch(console.error);
