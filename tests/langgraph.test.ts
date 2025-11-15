import openreason from "../src/index"

async function main() {
    openreason.init({
        provider: "mock" as any,
        apiKey: "",
        model: "mock",
        graph: { enabled: true }
    })

    const res = await openreason.reason("What is 3 + 4?")

    if (!res || typeof res.verdict !== "string" || res.verdict.length === 0) {
        throw new Error("Expected a verdict from LangGraph mode")
    }
    if (!res.mode) {
        throw new Error("Expected mode to be set in LangGraph mode")
    }
    console.log("LangGraph verdict:", res.verdict)
    console.log("✅ langgraph.test passed")
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
