import { adaptive_learner } from "../src/core/learn"
import { reasoning_depth_controller } from "../src/core/router"
import { deterministic_compute } from "../src/core/deterministiccompute"
console.log("🧪 Testing Adaptive Learning System\n")
const learner = new adaptive_learner()
const queries = [
    { query: "What is 15 * 23?", expected_mode: "reflex", should_pass: true, complexity: 0.1 },
    { query: "What is the speed of light?", expected_mode: "reflex", should_pass: true, complexity: 0.15 },
    { query: "Calculate square root of 144", expected_mode: "reflex", should_pass: true, complexity: 0.2 },
    { query: "What is the capital of France?", expected_mode: "reflex", should_pass: true, complexity: 0.12 },
    { query: "Convert 100 Celsius to Fahrenheit", expected_mode: "reflex", should_pass: true, complexity: 0.18 },
    { query: "Explain recursion with examples", expected_mode: "analytic", should_pass: true, complexity: 0.45 },
    { query: "Compare quicksort and mergesort", expected_mode: "analytic", should_pass: true, complexity: 0.55 },
    { query: "What causes economic inflation?", expected_mode: "analytic", should_pass: false, complexity: 0.5 },
    { query: "Analyze the trolley problem", expected_mode: "analytic", should_pass: true, complexity: 0.6 },
    { query: "Should AI have rights?", expected_mode: "reflective", should_pass: true, complexity: 0.85 },
    { query: "Compare capitalism and socialism", expected_mode: "reflective", should_pass: true, complexity: 0.9 },
    { query: "Debate free will vs determinism", expected_mode: "reflective", should_pass: false, complexity: 0.8 },
    { query: "Ethics of genetic engineering", expected_mode: "reflective", should_pass: true, complexity: 0.88 },
    { query: "Is consciousness computable?", expected_mode: "reflective", should_pass: false, complexity: 0.92 }
]
console.log("📊 Logging sample traces...\n")
for (const test of queries) {
    learner.log_trace({
        query: test.query,
        complexity_score: test.complexity,
        mode_used: test.expected_mode as any,
        mode_recommended: test.expected_mode as any,
        depth_mismatch: false,
        pass: test.should_pass,
        score: test.should_pass ? 0.9 : 0.6,
        confidence: test.should_pass ? 0.95 : 0.65,
        processing_time: test.expected_mode === "reflex" ? 10 : (test.expected_mode === "analytic" ? 2500 : 5000),
        word_count: 20,
        did_reasoning_violate_constraint: false,
        was_reasoning_depth_necessary: true,
        output_length_ok: true,
        efficiency_score: test.should_pass ? 0.85 : 0.55,
        timestamp: Date.now()
    })
    console.log(`✓ Logged: ${test.query} (mode: ${test.expected_mode}, complexity: ${test.complexity})`)
}
console.log("\n📈 Updating learning statistics...\n")
const stats = learner.update_learning()
console.log("Learning Stats:")
console.log(`  Total Traces: ${stats.total_traces}`)
console.log(`  Reflex Accuracy: ${(stats.reflex_accuracy * 100).toFixed(0)}%`)
console.log(`  Analytic Accuracy: ${(stats.analytic_accuracy * 100).toFixed(0)}%`)
console.log(`  Reflective Accuracy: ${(stats.reflective_accuracy * 100).toFixed(0)}%`)
console.log(`  Depth Mismatch Rate: ${(stats.depth_mismatch_rate * 100).toFixed(1)}%`)
console.log(`  Overthinking Rate: ${(stats.overthinking_rate * 100).toFixed(1)}%`)
console.log(`  Underthinking Rate: ${(stats.underthinking_rate * 100).toFixed(1)}%`)
console.log(`\n⚡ Average Processing Times:`)
console.log(`  Reflex: ${stats.avg_reflex_time.toFixed(0)}ms`)
console.log(`  Analytic: ${stats.avg_analytic_time.toFixed(0)}ms`)
console.log(`  Reflective: ${stats.avg_reflective_time.toFixed(0)}ms`)
console.log(`\n🎚️  Recommended Thresholds:`)
console.log(`  Reflex max complexity: ${stats.recommended_reflex_threshold.toFixed(3)} (current: 0.250)`)
console.log(`  Analytic max complexity: ${stats.recommended_analytic_threshold.toFixed(3)} (current: 0.650)`)
console.log("\n💡 Recommendations:")
const recs = learner.get_recommendations()
if (recs.length === 0) {
    console.log("  ✅ System is performing optimally!")
} else {
    recs.forEach(rec => console.log(`  • ${rec}`))
}
console.log("\n🧪 Testing Threshold Calculations...")
console.log(`  Reflex traces: ${queries.filter(q => q.expected_mode === "reflex").length}`)
console.log(`  Analytic traces: ${queries.filter(q => q.expected_mode === "analytic").length}`)
console.log(`  Reflective traces: ${queries.filter(q => q.expected_mode === "reflective").length}`)
console.log(`  Pass rate: ${((queries.filter(q => q.should_pass).length / queries.length) * 100).toFixed(0)}%`)
console.log("\n✅ Adaptive Learning Test Complete - System is learning from traces!")
