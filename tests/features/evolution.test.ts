import openreason from "../../src/index"
const { init, reason } = openreason

console.log("🧪 Testing Prompt Evolution Feature\n")

async function testPromptEvolution() {
    console.log("1️⃣ Initializing OpenReason with memory enabled...")

    init({
        provider: "google",
        apiKey: process.env.GOOGLE_API_KEY!,
        model: "gemini-1.5-flash",
        memory: {
            enabled: true,
            path: "./data/ucr_memory.db",
            blueprintThresh: 0.85,
            evolInterval: 3
        }
    })

    console.log("✓ Initialized\n")

    console.log("2️⃣ Running multiple reasoning queries to trigger evolution...")

    const queries = [
        "What is 2 + 2?",
        "Why is the sky blue?",
        "Should AI systems have rights?",
        "What causes gravity?",
        "Is democracy the best form of government?"
    ]

    for (let i = 0; i < queries.length; i++) {
        console.log(`\n📝 Query ${i + 1}/${queries.length}: "${queries[i]}"`)

        try {
            const result = await reason(queries[i])
            console.log(`   Response: ${result.verdict.substring(0, 100)}...`)
            console.log(`   Confidence: ${result.confidence.toFixed(2)}`)
            console.log(`   Mode: ${result.mode}`)
            console.log(`   Time: ${result.meta.proc_time}ms`)
        } catch (err: any) {
            console.error(`   ❌ Error: ${err.message}`)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log("\n3️⃣ Checking memory database...")

    const fs = await import("fs")
    const memoryPath = "./data/ucr_memory.db"

    if (fs.existsSync(memoryPath)) {
        const stats = fs.statSync(memoryPath)
        console.log(`✓ Memory database exists: ${memoryPath}`)
        console.log(`  Size: ${stats.size} bytes`)

        if (stats.size > 0) {
            console.log("✓ Database is not empty - prompt evolution is working!")
        } else {
            console.log("⚠️  Database is empty - evolution may not have triggered yet")
            console.log("   (Evolution triggers after 3+ queries with high confidence)")
        }
    } else {
        console.log("❌ Memory database not found")
    }

    console.log("\n4️⃣ Testing direct evolution engine...")

    try {
        const { evolution_engine } = await import("../../src/index")
        const evo = new evolution_engine()
        const bank = evo.get_bank()

        console.log("✓ Evolution engine loaded")

        const bestPrompt = await bank.get_best_prompt(3)
        if (bestPrompt) {
            console.log(`✓ Found evolved prompt: ${bestPrompt.id}`)
            console.log(`  Title: ${bestPrompt.title}`)
            console.log(`  Uses: ${bestPrompt.stats.use_count}`)
            console.log(`  Avg Confidence: ${bestPrompt.stats.avg_confidence.toFixed(2)}`)
        } else {
            console.log("ℹ️  No evolved prompts yet (run more queries to accumulate data)")
        }
    } catch (err: any) {
        console.error(`❌ Evolution engine test failed: ${err.message}`)
    }
}

console.log("=".repeat(60))
testPromptEvolution().then(() => {
    console.log("\n" + "=".repeat(60))
    console.log("✅ Prompt Evolution Test Complete")
    process.exit(0)
}).catch(err => {
    console.error("\n❌ Test failed:", err)
    process.exit(1)
})
