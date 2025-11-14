import openreason from "openreason";

// example 1: openai configuration
async function openaiExample() {
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
        simpleModel: "gpt-4o-mini",
        complexModel: "gpt-4o",
    });

    const result = await openreason.reason("explain quantum entanglement");
    console.log("openai result:", result.verdict);
    console.log("model used:", result.model_used);
}

// example 2: anthropic configuration
async function anthropicExample() {
    openreason.init({
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY!,
        model: "claude-3-5-sonnet-20241022",
        simpleModel: "claude-3-5-haiku-20241022",
    });

    const result = await openreason.reason("what is consciousness?");
    console.log("anthropic result:", result.verdict);
    console.log("confidence:", result.confidence);
}

// example 3: google gemini configuration
async function googleExample() {
    openreason.init({
        provider: "google",
        apiKey: process.env.GOOGLE_API_KEY!,
        model: "gemini-1.5-pro",
        simpleModel: "gemini-1.5-flash",
    });

    const result = await openreason.reason(
        "summarize the theory of relativity"
    );
    console.log("google result:", result.verdict);
    console.log("mode:", result.mode);
}

// example 4: xai configuration
async function xaiExample() {
    openreason.init({
        provider: "xai",
        apiKey: process.env.XAI_API_KEY!,
        model: "grok-beta",
    });

    const result = await openreason.reason("explain machine learning");
    console.log("xai result:", result.verdict);
}

// example 5: switching providers dynamically
async function dynamicProviderExample() {
    const query = "what is the meaning of life?";

    // try with openai
    openreason.init({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4o",
    });
    const openaiResult = await openreason.reason(query);
    console.log("openai answer:", openaiResult.verdict);

    // switch to anthropic
    openreason.init({
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY!,
        model: "claude-3-5-sonnet-20241022",
    });
    const anthropicResult = await openreason.reason(query);
    console.log("anthropic answer:", anthropicResult.verdict);

    // compare confidence scores
    console.log("openai confidence:", openaiResult.confidence);
    console.log("anthropic confidence:", anthropicResult.confidence);
}

// run examples
async function main() {
    console.log("\n=== openai example ===");
    await openaiExample();

    console.log("\n=== anthropic example ===");
    await anthropicExample();

    console.log("\n=== google example ===");
    await googleExample();

    console.log("\n=== dynamic provider switching ===");
    await dynamicProviderExample();
}

main().catch(console.error);
