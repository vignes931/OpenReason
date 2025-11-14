import { hierarchical_memory } from "../src/memory_unit/hierarchicalmemory"
import { memory_adapter } from "../src/memory_unit/memoryadapter"
async function test_memory() {
    console.log("🧪 Testing Hierarchical Memory System\n")
    const mem = new hierarchical_memory()
    const adapter = new memory_adapter()
    console.log("📝 Storing episodic memories...\n")
    const episodes = [
        {
            timestamp: Date.now(),
            query: "What is 2 + 2?",
            verdict: "4",
            confidence: 1.0,
            reflection: { coherence: 1.0 }
        },
        {
            timestamp: Date.now() + 1000,
            query: "What is the capital of France?",
            verdict: "Paris",
            confidence: 0.95,
            reflection: { coherence: 0.95 }
        },
        {
            timestamp: Date.now() + 2000,
            query: "Should AI have consciousness?",
            verdict: "This is a complex philosophical question...",
            confidence: 0.7,
            reflection: { coherence: 0.8 }
        }
    ]
    for (const episode of episodes) {
        await mem.store_episodic(episode)
        console.log(`✓ Stored: "${episode.query}" (conf: ${episode.confidence})`)
    }
    console.log("\n📊 Loading episodic memory...")
    const loaded = await mem.load_episodic()
    console.log(`   Total episodes: ${loaded.length}`)
    console.log("\n🧠 Checking semantic patterns...")
    const semantic = await mem.load_semantic()
    console.log(`   Semantic rules extracted: ${semantic.length}`)
    if (semantic.length > 0) {
        semantic.forEach(rule => {
            console.log(`   • ${rule.pattern}: ${rule.abstraction}`)
            console.log(`     Frequency: ${rule.frequency}, Success Rate: ${(rule.success_rate * 100).toFixed(0)}%`)
        })
    }
    console.log("\n⚙️ Testing procedural memory...")
    await mem.store_procedural({
        name: "math_reasoning",
        template: "For math queries, use deterministic compute",
        avg_confidence: 0.98,
        use_count: 1
    })
    const procedures = await mem.load_procedural()
    console.log(`   Procedural schemas: ${procedures.length}`)
    const best = await mem.get_best_schema()
    if (best) {
        console.log(`   Best schema: ${best.name}`)
        console.log(`     Avg Confidence: ${best.avg_confidence}`)
        console.log(`     Use Count: ${best.use_count}`)
    }
    console.log("\n📁 Testing prompt memory adapter...")
    await adapter.save_prompts([
        {
            id: "default_prompt",
            title: "Default Reasoning Prompt",
            system: "You are a reasoning system",
            score: 0.85,
            usage_count: 10,
            avg_conf: 0.82
        }
    ])
    const prompts = await adapter.load_prompts()
    console.log(`   Loaded prompts: ${prompts.length}`)
    await adapter.add_perf({
        id: "default_prompt",
        conf: 0.9,
        proc_time: 500,
        compliance: 0.95,
        coherence: 0.88,
        ts: Date.now()
    })
    const stats = await adapter.get_prompt_stats("default_prompt")
    if (stats) {
        console.log(`   Prompt stats:`)
        console.log(`     Usage count: ${stats.count}`)
        console.log(`     Avg confidence: ${stats.avg_conf.toFixed(2)}`)
        console.log(`     Avg time: ${stats.avg_time.toFixed(0)}ms`)
    }
    console.log("\n✅ Hierarchical Memory Test Complete")
}
test_memory().catch(console.error)
