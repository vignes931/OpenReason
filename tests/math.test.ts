import openreason from "../src/index"

async function main() {
    openreason.init({ provider: "mock" as any, apiKey: "", model: "mock" })
    const res = await openreason.reason("What is 2 + 2?")
    console.log("mode:", res.mode)
    console.log("domain:", res.domain)
    console.log("verdict:", res.verdict)
    if (!(typeof res.confidence === "number" && res.confidence >= 0 && res.confidence <= 1)) {
        throw new Error("Confidence out of range")
    }
    console.log("✅ math.test passed")
}
main().catch(e => { console.error(e); process.exit(1) })
