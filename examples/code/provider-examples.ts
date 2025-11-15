import openreason from "openreason";

type ProviderConfig = {
    provider: "openai" | "anthropic" | "google" | "xai"
    apiKey: string
    model: string
    simpleModel?: string
    complexModel?: string
};

const missingKey = (name: string) => {
    console.warn(`Skipping ${name} example because the API key is not set.`);
};

async function runExample(label: string, cfg: ProviderConfig, query: string) {
    if (!cfg.apiKey) {
        missingKey(label);
        return;
    }
    console.log(`\n=== ${label} ===`);
    openreason.init(cfg);
    const result = await openreason.reason(query);
    console.log({ verdict: result.verdict, confidence: result.confidence, mode: result.mode, latency: result.latency, domain: result.domain });
}

async function main() {
    await runExample("openai", {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4o",
        simpleModel: "gpt-4o-mini",
        complexModel: "gpt-4o"
    }, "explain quantum entanglement");

    await runExample("anthropic", {
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY || "",
        model: "claude-3-5-sonnet-20241022",
        simpleModel: "claude-3-5-haiku-20241022"
    }, "what is consciousness?");

    await runExample("google", {
        provider: "google",
        apiKey: process.env.GOOGLE_API_KEY || "",
        model: "gemini-1.5-pro",
        simpleModel: "gemini-1.5-flash"
    }, "summarize the theory of relativity");

    const openaiQuery = "what is the meaning of life?";
    const openaiKey = process.env.OPENAI_API_KEY || "";
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    if (openaiKey && anthropicKey) {
        console.log("\n=== dynamic provider switching ===");
        openreason.init({ provider: "openai", apiKey: openaiKey, model: "gpt-4o" });
        const openaiResult = await openreason.reason(openaiQuery);
        openreason.init({ provider: "anthropic", apiKey: anthropicKey, model: "claude-3-5-sonnet-20241022" });
        const anthropicResult = await openreason.reason(openaiQuery);
        console.log({ openai: openaiResult.confidence, anthropic: anthropicResult.confidence });
    } else {
        console.warn("Skipping dynamic provider comparison because both OPENAI_API_KEY and ANTHROPIC_API_KEY are required.");
    }
}

main().catch(console.error);
