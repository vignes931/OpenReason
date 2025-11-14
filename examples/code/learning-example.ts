import openreason from "openreason";
import { adaptive_learner } from "openreason";

openreason.init({
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    simpleModel: "gpt-4o-mini",
});

async function learningExamples() {
    const learner = new adaptive_learner();

    console.log("\n=== adaptive learning example ===");

    // simulate reasoning traces
    const queries = [
        { text: "2 + 2", expected_mode: "reflex", complexity: 0.1 },
        { text: "explain gravity", expected_mode: "analytic", complexity: 0.4 },
        {
            text: "should ai have rights?",
            expected_mode: "reflective",
            complexity: 0.8,
        },
        { text: "capital of france", expected_mode: "reflex", complexity: 0.15 },
        {
            text: "compare capitalism vs socialism",
            expected_mode: "reflective",
            complexity: 0.75,
        },
    ];

    // run queries and log traces
    console.log("\nrunning queries and logging traces...");
    for (const q of queries) {
        const result = await openreason.reason(q.text);

        learner.log_trace({
            query: q.text,
            complexity_score: q.complexity,
            mode_used: result.mode,
            mode_recommended: q.expected_mode as "reflex" | "analytic" | "reflective",
            depth_mismatch: result.mode !== q.expected_mode,
            pass: result.confidence > 0.7,
            score: result.confidence,
            confidence: result.confidence,
            processing_time: result.timing?.total_ms || 0,
            word_count: result.verdict.split(/\s+/).length,
            did_reasoning_violate_constraint: (result.violations || 0) > 0,
            was_reasoning_depth_necessary: result.mode === q.expected_mode,
            output_length_ok: result.verdict.length < 5000,
            efficiency_score: result.confidence,
            timestamp: Date.now(),
        });

        console.log(`query: "${q.text}"`);
        console.log(`  mode: ${result.mode} (expected: ${q.expected_mode})`);
        console.log(`  confidence: ${result.confidence}`);
        console.log(`  complexity: ${q.complexity}`);
    }

    // update learning statistics
    console.log("\n=== learning statistics ===");
    const stats = learner.update_learning();

    console.log("reflex accuracy:", stats.reflex_accuracy.toFixed(2));
    console.log("analytic accuracy:", stats.analytic_accuracy.toFixed(2));
    console.log("reflective accuracy:", stats.reflective_accuracy.toFixed(2));

    console.log("\nrecommended thresholds:");
    console.log("  reflex -> analytic:", stats.recommended_reflex_threshold.toFixed(2));
    console.log(
        "  analytic -> reflective:",
        stats.recommended_analytic_threshold.toFixed(2)
    );

    // get recommendations
    console.log("\n=== recommendations ===");
    const recs = learner.get_recommendations();

    if (recs.length > 0) {
        recs.forEach(rec => console.log(`• ${rec}`));
    } else {
        console.log("No recommendations - system performing optimally");
    }

    console.log("\noverthinking rate:", (stats.overthinking_rate * 100).toFixed(0) + "%");
    console.log("underthinking rate:", (stats.underthinking_rate * 100).toFixed(0) + "%");

    // apply learned thresholds
    console.log("\n=== applying learned thresholds ===");
    console.log("new thresholds applied to routing system");

    // test with adjusted thresholds
    const test = await openreason.reason("explain machine learning");
    console.log("\ntest query: 'explain machine learning'");
    console.log("mode selected:", test.mode);
    console.log("confidence:", test.confidence);
}

// run examples
learningExamples().catch(console.error);
