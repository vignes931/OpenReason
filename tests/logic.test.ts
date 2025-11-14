import openreason from "../src/index"

async function main() {
    openreason.init({ provider: "mock" as any, apiKey: "", model: "mock" })
    const res = await openreason.reason("If all humans are mortal and Socrates is human, is Socrates mortal?")
    console.log("mode:", res.mode)
    console.log("domain:", res.domain)
    console.log("verdict:", res.verdict)
    if (!res.verdict.toLowerCase().includes("mortal")) {
        throw new Error("Expected mortal in verdict")
    }
    console.log("✅ logic.test passed")
}
main().catch(e => { console.error(e); process.exit(1) })
