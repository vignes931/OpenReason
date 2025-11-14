import openreason from "../src/index"

async function main() {
    openreason.init({ provider: "mock" as any, apiKey: "", model: "mock", simpleModel: "mock" })
    const res = await openreason.reason("Why does entropy always increase?")
    if (!res.mode || !res.domain || typeof res.latency !== "number") {
        throw new Error("Missing fields in result")
    }
    console.log(JSON.stringify({ verdict: res.verdict, confidence: res.confidence, mode: res.mode, domain: res.domain }))
    console.log("✅ reason.test passed")
}
main().catch(e => { console.error(e); process.exit(1) })
