import openreason from "../src/index"

async function main() {
    openreason.init({ provider: "mock" as any, apiKey: "", model: "mock", memory: { enabled: true, path: "./data/memory.db" } })
    for (let i = 0; i < 10; i++) {
        await openreason.reason("Why is the sky blue?")
    }
    console.log("✅ evolution.test ran (no assertion)")
}
main().catch(e => { console.error(e); process.exit(1) })
