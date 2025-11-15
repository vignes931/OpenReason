import openreason from "openreason";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY before running the basic examples.");
}

openreason.init({
    provider: "openai",
    apiKey,
    model: "gpt-4o",
    simpleModel: "gpt-4o-mini",
    complexModel: "gpt-4o",
    memory: { enabled: true, path: "./data/examples-memory.db" },
    performance: { maxRetries: 2, timeout: 45000 }
});

async function examples() {
    console.log("\n=== example 1: quick math ===");
    const math = await openreason.reason("what is 144 * 12?");
    console.log({ verdict: math.verdict, confidence: math.confidence, mode: math.mode, latency: math.latency });

    console.log("\n=== example 2: logic chain ===");
    const logic = await openreason.reason("if all humans are mortal and socrates is human, is socrates mortal?");
    console.log({ verdict: logic.verdict, confidence: logic.confidence, mode: logic.mode, domain: logic.domain });

    console.log("\n=== example 3: factual lookup ===");
    const fact = await openreason.reason("what is the capital of france?");
    console.log({ verdict: fact.verdict, metadata: fact.metadata });

    console.log("\n=== example 4: technical explanation ===");
    const tech = await openreason.reason("explain recursion in programming");
    console.log({ verdict: tech.verdict, confidence: tech.confidence, structure: tech.metadata?.structure });

    console.log("\n=== example 5: ethics prompt ===");
    const ethics = await openreason.reason("is it ethical for autonomous vehicles to make life-or-death decisions?");
    console.log({ verdict: ethics.verdict, confidence: ethics.confidence, mode: ethics.mode, violations: ethics.violations });

    console.log("\n=== example 6: comparison question ===");
    const compare = await openreason.reason("what are the tradeoffs between typescript and javascript?");
    console.log({ verdict: compare.verdict, confidence: compare.confidence, complexity: compare.complexity });

    console.log("\n=== example 7: metadata inspection ===");
    const meta = await openreason.reason("should we colonize mars?");
    console.log({ verdict: meta.verdict, mode: meta.mode, metadata: meta.metadata });
}

examples().catch(console.error);
