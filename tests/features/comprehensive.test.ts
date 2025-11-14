import openreason from "../../src/index"
const { init, reason } = openreason

console.log("🧪 Comprehensive OpenReason Feature Test Suite\n")

const tests = {
    passed: 0,
    failed: 0,
    results: [] as Array<{ name: string, status: string, details?: string }>
}

function reportTest(name: string, passed: boolean, details?: string) {
    const status = passed ? "✅ PASS" : "❌ FAIL"
    console.log(`${status} ${name}`)
    if (details) console.log(`   ${details}`)

    tests.results.push({ name, status, details })
    if (passed) tests.passed++
    else tests.failed++
}

async function runAllTests() {
    console.log("=".repeat(60))
    console.log("INITIALIZATION TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        init({
            provider: "google",
            apiKey: process.env.GOOGLE_API_KEY!,
            model: "gemini-1.5-flash"
        })
        reportTest("Basic Initialization", true, "OpenReason initialized successfully")
    } catch (err: any) {
        reportTest("Basic Initialization", false, err.message)
        return
    }

    console.log("\n" + "=".repeat(60))
    console.log("REASONING MODE TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const reflexResult = await reason("What is 144 * 12?")
        const isReflex = reflexResult.mode === "reflex" || reflexResult.complexity < 0.3
        reportTest("Reflex Mode (Simple Math)", isReflex, `Mode: ${reflexResult.mode}, Complexity: ${reflexResult.complexity}`)
    } catch (err: any) {
        reportTest("Reflex Mode", false, err.message)
    }

    try {
        const analyticResult = await reason("If all humans are mortal and Socrates is human, is Socrates mortal?")
        const isAnalytic = analyticResult.mode === "analytic" || (analyticResult.complexity >= 0.3 && analyticResult.complexity < 0.7)
        reportTest("Analytic Mode (Logic)", isAnalytic, `Mode: ${analyticResult.mode}, Complexity: ${analyticResult.complexity}`)
    } catch (err: any) {
        reportTest("Analytic Mode", false, err.message)
    }

    try {
        const reflectiveResult = await reason("Should an AI sacrifice one human to save five?")
        const isReflective = reflectiveResult.mode === "reflective" || reflectiveResult.complexity >= 0.7
        reportTest("Reflective Mode (Ethics)", isReflective, `Mode: ${reflectiveResult.mode}, Complexity: ${reflectiveResult.complexity}`)
    } catch (err: any) {
        reportTest("Reflective Mode", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("PRECISION CORE TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const { precisionCore } = await import("../src/precision")
        reportTest("Precision Core Import", true, "Loaded successfully")

        const testResult = await reason("What is the capital of France?")
        const compressed = await precisionCore.apply(testResult)

        const hasCompression = compressed.compressed.compression_ratio < 1
        reportTest("Post-Reasoning Compression", hasCompression, `Compression ratio: ${compressed.compressed.compression_ratio.toFixed(2)}`)

        const isCompliant = compressed.compliance.compliant || compressed.compliance.violations.length === 0
        reportTest("Mode Compliance", isCompliant, `Violations: ${compressed.compliance.violations.length}`)

    } catch (err: any) {
        reportTest("Precision Core", false, err.message)
    }

    try {
        const { semantic_evaluator } = await import("../src/precision/semantic_evaluator")
        const evaluator = new semantic_evaluator()
        const result = await evaluator.evaluate("Paris", "Paris")

        reportTest("Semantic Evaluator", result.score > 80, `Score: ${result.score.toFixed(1)}`)
    } catch (err: any) {
        reportTest("Semantic Evaluator", false, err.message)
    }

    try {
        const { path_pruner } = await import("../src/precision/path_pruner")
        const pruner = new path_pruner()

        pruner.shouldKeepPath("path1", "This is a unique reasoning path")
        const shouldPrune = !pruner.shouldKeepPath("path2", "This is a unique reasoning path")

        reportTest("Path Pruning Heuristic", shouldPrune, "Redundant paths detected and pruned")
    } catch (err: any) {
        reportTest("Path Pruning", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("MEMORY & LEARNING TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const { hierarchical_memory } = await import("../src/index")
        const memory = new hierarchical_memory()

        await memory.store_episodic({
            query: "test query",
            response: "test response",
            conf: 0.9,
            timestamp: Date.now()
        })

        const episodes = await memory.load_episodic()
        reportTest("Hierarchical Memory Storage", episodes.length > 0, `Stored ${episodes.length} episodes`)
    } catch (err: any) {
        reportTest("Hierarchical Memory", false, err.message)
    }

    try {
        const { adaptive_learner } = await import("../src/index")
        const learner = new adaptive_learner()

        learner.log_outcome({
            query: "test",
            conf: 0.8,
            complexity: 0.5,
            mode: "analytic",
            success: true,
            latency: 100
        })

        const stats = learner.get_stats()
        reportTest("Adaptive Learner", stats.total_queries > 0, `Tracked ${stats.total_queries} queries`)
    } catch (err: any) {
        reportTest("Adaptive Learner", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("CONSTRAINT & VALIDATION TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const testResult = await reason("Should robots have feelings?")

        const hasConstraints = testResult.meta?.compliance !== undefined
        reportTest("Constraint Engine", hasConstraints, `Compliance ratio: ${testResult.meta?.compliance?.ratio.toFixed(2) || 'N/A'}`)
    } catch (err: any) {
        reportTest("Constraint Engine", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("CONFIGURATION TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const { load_cfg } = await import("../src/utils/config")
        const config = load_cfg()

        const hasModels = config.models.simple && config.models.moderate && config.models.complex
        reportTest("Config Loading", hasModels, `Provider: ${config.models.simple.provider}`)

        const hasMemory = config.memory.enabled !== undefined
        reportTest("Memory Config", hasMemory, `Path: ${config.memory.path}`)

        const hasRouting = config.routing.reflex_threshold !== undefined
        reportTest("Routing Config", hasRouting, `Reflex: ${config.routing.reflex_threshold}, Analytic: ${config.routing.analytic_threshold}`)
    } catch (err: any) {
        reportTest("Configuration", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("RESPONSE STRUCTURE TESTS")
    console.log("=".repeat(60) + "\n")

    try {
        const result = await reason("What is 2 + 2?")

        const hasVerdict = typeof result.verdict === "string" && result.verdict.length > 0
        reportTest("Response Verdict", hasVerdict, `Length: ${result.verdict.length} chars`)

        const hasConfidence = typeof result.confidence === "number" && result.confidence >= 0 && result.confidence <= 1
        reportTest("Response Confidence", hasConfidence, `Value: ${result.confidence.toFixed(2)}`)

        const hasMode = ["reflex", "analytic", "reflective"].includes(result.mode)
        reportTest("Response Mode", hasMode, `Mode: ${result.mode}`)

        const hasMeta = result.meta !== undefined && result.meta.proc_time !== undefined
        reportTest("Response Metadata", hasMeta, `Processing time: ${result.meta?.proc_time}ms`)
    } catch (err: any) {
        reportTest("Response Structure", false, err.message)
    }

    console.log("\n" + "=".repeat(60))
    console.log("TEST SUMMARY")
    console.log("=".repeat(60) + "\n")

    console.log(`Total Tests: ${tests.passed + tests.failed}`)
    console.log(`✅ Passed: ${tests.passed}`)
    console.log(`❌ Failed: ${tests.failed}`)
    console.log(`Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`)

    if (tests.failed > 0) {
        console.log("\n⚠️  Failed Tests:")
        tests.results.filter(r => r.status.includes("FAIL")).forEach(r => {
            console.log(`   - ${r.name}: ${r.details}`)
        })
    }

    return tests.failed === 0
}

runAllTests().then(success => {
    console.log("\n" + "=".repeat(60))
    if (success) {
        console.log("✅ ALL TESTS PASSED")
        process.exit(0)
    } else {
        console.log("❌ SOME TESTS FAILED")
        process.exit(1)
    }
}).catch(err => {
    console.error("\n💥 Test suite crashed:", err)
    process.exit(1)
})
