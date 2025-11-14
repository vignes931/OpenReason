import openreason from "openreason";

// initialize openreason
openreason.init({
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    simpleModel: "gpt-4o-mini",
});

async function examples() {
    // example 1: simple math (deterministic, 0ms)
    console.log("\n=== example 1: simple math ===");
    const math = await openreason.reason("what is 144 * 12?");
    console.log("query:", "what is 144 * 12?");
    console.log("verdict:", math.verdict);
    console.log("confidence:", math.confidence);
    console.log("mode:", math.mode); // reflex
    console.log("reasoning time:", math.timing?.total_ms || 0, "ms");

    // example 2: logical reasoning
    console.log("\n=== example 2: logical reasoning ===");
    const logic = await openreason.reason(
        "if all humans are mortal, and socrates is human, is socrates mortal?"
    );
    console.log("query:", "if all humans are mortal...");
    console.log("verdict:", logic.verdict);
    console.log("confidence:", logic.confidence);
    console.log("mode:", logic.mode); // analytic

    // example 3: factual question
    console.log("\n=== example 3: factual question ===");
    const fact = await openreason.reason("what is the capital of france?");
    console.log("query:", "what is the capital of france?");
    console.log("verdict:", fact.verdict);
    console.log("confidence:", fact.confidence);
    console.log("mode:", fact.mode); // reflex or analytic

    // example 4: technical explanation
    console.log("\n=== example 4: technical explanation ===");
    const tech = await openreason.reason("explain recursion in programming");
    console.log("query:", "explain recursion in programming");
    console.log("verdict:", tech.verdict);
    console.log("confidence:", tech.confidence);
    console.log("mode:", tech.mode); // analytic

    // example 5: ethical dilemma (complex)
    console.log("\n=== example 5: ethical dilemma ===");
    const ethics = await openreason.reason(
        "is it ethical for ai systems to make life-or-death decisions in autonomous vehicles?"
    );
    console.log("query:", "is it ethical for ai systems...");
    console.log("verdict:", ethics.verdict);
    console.log("confidence:", ethics.confidence);
    console.log("mode:", ethics.mode); // reflective
    console.log("uncertainty:", ethics.uncertainty);

    // example 6: comparison question
    console.log("\n=== example 6: comparison ===");
    const compare = await openreason.reason(
        "what are the tradeoffs between typescript and javascript?"
    );
    console.log("query:", "typescript vs javascript tradeoffs");
    console.log("verdict:", compare.verdict);
    console.log("confidence:", compare.confidence);
    console.log("mode:", compare.mode); // analytic or reflective

    // example 7: accessing metadata
    console.log("\n=== example 7: metadata inspection ===");
    const meta = await openreason.reason("should we colonize mars?");
    console.log("query:", "should we colonize mars?");
    console.log("verdict:", meta.verdict);
    console.log("mode:", meta.mode);
    console.log("complexity score:", meta.complexity);
    console.log("constitutional violations:", meta.violations || 0);
    console.log("perspectives analyzed:", meta.perspectives?.length || 0);
}

// run examples
examples().catch(console.error);
