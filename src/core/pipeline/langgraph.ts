import { Annotation, MemorySaver, StateGraph, START, END } from "@langchain/langgraph"
import { openreason_config } from "../config/init"
import { classify_query, ClassificationResult } from "./classifier"
import { get_similar_traces, store_trace } from "../utils/memory"
import { vectorize } from "../../utils/vectorize"
import { similarity } from "../../utils/similarity"
import { estimate_complexity } from "../config/router"
import { quick_respond } from "./shared"
import { detect_structure, ProblemStructure } from "../utils/structure"
import { decompose_problem, DecompositionResult } from "./decompose"
import { generate_formal_skeleton, FormalSkeleton } from "../verification/formal"
import { generate_skeleton, ReasoningSkeleton } from "./skeleton"
import { solve_skeleton, SolverResult } from "./solver"
import { verify_solution, VerificationResult } from "../verification/verifier"
import { verify_math_reasoning, MathVerificationResult, verify_logic_consistency, LogicVerificationResult } from "../verification/verify"
import { repair_reasoning, RepairInstruction } from "../verification/repair"
import { unify_steps } from "../utils/unify"
import { finalize_reasoning, FinalizerResult } from "./finalizer"
import { evaluate, evaluation } from "../verification/evaluator"
import { unified_quality } from "../utils/metrics"
import { evolve_prompt } from "../utils/evolve"
import { log_error, log_info } from "../utils/logger"
import { type reasoning_result } from "./reason"

type MemoryTrace = Awaited<ReturnType<typeof get_similar_traces>>[number]

const ReasonGraphState = Annotation.Root({
    query: Annotation<string>(),
    startTime: Annotation<number>(),
    classification: Annotation<ClassificationResult | null>(),
    similar: Annotation<MemoryTrace[] | undefined>(),
    context: Annotation<string | undefined>(),
    skeleton: Annotation<ReasoningSkeleton | null>(),
    solverResult: Annotation<SolverResult | null>(),
    verification: Annotation<VerificationResult | null>(),
    mathCheck: Annotation<MathVerificationResult | null>(),
    logicCheck: Annotation<LogicVerificationResult | null>(),
    finalized: Annotation<FinalizerResult | null>(),
    unifiedText: Annotation<string | null>(),
    unifiedCoherence: Annotation<number>(),
    retries: Annotation<number>(),
    result: Annotation<reasoning_result | null>(),
    structure: Annotation<ProblemStructure | null>(),
    decomposition: Annotation<DecompositionResult | null>(),
    formal: Annotation<FormalSkeleton | null>(),
    evaluation: Annotation<evaluation | null>()
})

type ReasonGraphStateType = typeof ReasonGraphState.State

const buildSimilarContext = (similar?: MemoryTrace[]): string | undefined => {
    if (!similar || similar.length === 0) return undefined
    return `Similar past reasoning:\n${similar.map((s, i) => `${i + 1}. ${s.query} -> ${s.verdict}`).join("\n")}`
}

const createClassifyNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    const classification = classify_query(state.query)
    log_info(`[LANGGRAPH] classify type=${classification.type} domain=${classification.domain} depth=${classification.requiredDepth}`)
    const similar = cfg.memory?.enabled ? await get_similar_traces(state.query, 3) : []
    const context = buildSimilarContext(similar)
    return { classification, similar, context }
}

const createCacheNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    const similar = state.similar ?? []
    if (!cfg.memory?.enabled || !state.classification || similar.length === 0) {
        return {}
    }
    const qv = vectorize(state.query)
    const best = similar[0]
    const score = similarity(qv, vectorize(best.query))
    const hasStrongAccuracy = typeof best.accuracy === "number" && best.accuracy >= 0.85
    const hasStrongConfidence = typeof best.confidence === "number" && best.confidence >= 0.8
    const isFresh = typeof (best as any).timestamp === "number" && (Date.now() - (best as any).timestamp) > 2000
    if (score >= 0.9 && hasStrongAccuracy && hasStrongConfidence && isFresh) {
        const latency = Date.now() - (state.startTime || Date.now())
        const cachedResult: reasoning_result = {
            verdict: best.verdict,
            confidence: Math.min(1, best.confidence + 0.05),
            mode: "reflex",
            domain: state.classification.domain,
            complexity: estimate_complexity(state.query),
            violations: 0,
            latency,
            metadata: { cached: true, cacheSimilarity: score }
        }
        log_info(`[LANGGRAPH] cache hit - sim=${score.toFixed(2)}`)
        return { result: cachedResult }
    }
    return {}
}

const createQuickNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    const classification = state.classification
    if (!classification?.mustStopReasoning) {
        return {}
    }
    const quick = await quick_respond(state.query, cfg, classification.domain)
    const evaluation = await evaluate(quick, state.query, classification.domain, "reflex")
    const latency = Date.now() - (state.startTime || Date.now())
    const Q = unified_quality(evaluation.accuracy, evaluation.compliance, 0, latency)
    const result: reasoning_result = {
        verdict: quick,
        confidence: evaluation.confidence,
        mode: "reflex",
        domain: classification.domain,
        complexity: estimate_complexity(state.query),
        violations: 0,
        latency,
        metadata: { quick: true, Q }
    }
    if (cfg.memory?.enabled) {
        await store_trace({
            query: state.query,
            verdict: quick,
            confidence: evaluation.confidence,
            mode: "reflex",
            domain: classification.domain,
            accuracy: evaluation.accuracy,
            latency
        })
    }
    return { result, evaluation }
}

const createStructureNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    if (!state.classification) {
        throw new Error("LangGraph missing classification before structure stage")
    }
    const structure = detect_structure(state.query, state.classification.domain)
    const decomposition = decompose_problem(state.query, structure)
    const formal = generate_formal_skeleton(structure, decomposition)
    log_info(`[LANGGRAPH] structure=${structure.type} schema=${formal.schema}`)
    const skeleton = await generate_skeleton(state.query, state.classification, cfg, state.context)
    return { structure, decomposition, formal, skeleton }
}

const createSolveNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    if (!state.classification || !state.skeleton) {
        throw new Error("LangGraph missing prerequisites for solver node")
    }
    const classification = state.classification
    const skeleton = state.skeleton as ReasoningSkeleton
    let solverResult = await solve_skeleton(state.query, skeleton, classification, cfg)
    let verification = await verify_solution(state.query, skeleton, solverResult.steps, classification, cfg)
    const structure = state.structure || detect_structure(state.query, classification.domain)
    const allSteps = solverResult.steps.map(s => s.content)
    const stepsText = allSteps.join("\n")
    const mathVerif = verify_math_reasoning(stepsText, structure)
    const logicVerif = verify_logic_consistency(stepsText)

    let retries = 0
    const maxRetries = 1
    const repairInstructions: RepairInstruction[] = []

    if (!mathVerif.passed) {
        repairInstructions.push({ step: 0, issue: "Math verification failed", suggestion: mathVerif.details })
    }
    if (!logicVerif.passed) {
        repairInstructions.push({ step: 0, issue: "Logic inconsistency", suggestion: logicVerif.details })
    }
    if (!verification.passed && verification.suggestions.length > 0) {
        verification.suggestions.forEach((sug, idx) => repairInstructions.push({ step: idx + 1, issue: "Verification failure", suggestion: sug }))
    }

    if (repairInstructions.length > 0 && retries < maxRetries) {
        retries += 1
        const repaired = await repair_reasoning(stepsText, repairInstructions, cfg)
        if (repaired.success) {
            solverResult.steps = repaired.repaired.split(/\n\n+/).map((content, idx) => ({ title: `Step ${idx + 1}`, content }))
            verification = await verify_solution(state.query, skeleton, solverResult.steps, classification, cfg)
        }
    }

    const unified = unify_steps(solverResult.steps.map(s => s.content))
    const finalized = finalize_reasoning({
        query: state.query,
        classification,
        skeleton,
        solved: solverResult.steps,
        verification,
        retries
    })

    return {
        solverResult,
        verification,
        mathCheck: mathVerif,
        logicCheck: logicVerif,
        finalized,
        unifiedText: unified.unified,
        unifiedCoherence: unified.coherence,
        retries
    }
}

const createEvaluateNode = (cfg: openreason_config) => async (state: ReasonGraphStateType) => {
    if (!state.classification || !state.finalized || !state.verification) {
        throw new Error("LangGraph evaluation missing required artifacts")
    }
    const domain = state.classification.domain
    const verdictText = state.unifiedText || state.finalized.verdict
    const evaluation = await evaluate(verdictText, state.query, domain, state.finalized.mode)
    const latency = Date.now() - (state.startTime || Date.now())
    const mathVerif: MathVerificationResult = state.mathCheck ?? { passed: true, method: "heuristic", details: "", confidence: 1 }
    const logicVerif: LogicVerificationResult = state.logicCheck ?? { passed: true, contradictions: 0, consistencyScore: 1, details: "" }
    const verification = state.verification
    const coherence = state.unifiedCoherence ?? state.finalized.confidence
    const finalConfidence = Math.min(state.finalized.confidence, coherence)
    const result: reasoning_result = {
        verdict: verdictText,
        confidence: finalConfidence,
        mode: state.finalized.mode,
        domain,
        complexity: estimate_complexity(state.query),
        violations: verification.issues.length + (!mathVerif.passed ? 1 : 0) + (!logicVerif.passed ? 1 : 0),
        latency,
        metadata: {
            accuracy: evaluation.accuracy,
            compliance: evaluation.compliance,
            verificationScore: verification.score,
            mathVerification: mathVerif,
            logicVerification: logicVerif,
            coherence,
            structure: state.structure?.type || "general",
            schema: state.formal?.schema,
            passedChecks: state.finalized.passedChecks,
            failedChecks: state.finalized.failedChecks,
            issues: verification.issues,
            retries: state.retries ?? 0,
            Q: unified_quality(evaluation.accuracy, evaluation.compliance, verification.score, latency)
        }
    }

    if (cfg.memory?.enabled) {
        await store_trace({
            query: state.query,
            verdict: state.finalized.verdict,
            confidence: state.finalized.confidence,
            mode: state.finalized.mode,
            domain,
            accuracy: evaluation.accuracy,
            latency
        })
    }

    const evolution_step = await evolve_prompt({ accuracy: evaluation.accuracy, compliance: evaluation.compliance, latency })
    if (evolution_step > 0) {
        result.evolutionStep = evolution_step
    }

    return { evaluation, result }
}

const buildGraph = (cfg: openreason_config) => {
    const graphBuilder: any = new StateGraph(ReasonGraphState)
    graphBuilder.addNode("classify", createClassifyNode(cfg))
    graphBuilder.addNode("cache", createCacheNode(cfg))
    graphBuilder.addNode("quick", createQuickNode(cfg))
    graphBuilder.addNode("structure", createStructureNode(cfg))
    graphBuilder.addNode("solve", createSolveNode(cfg))
    graphBuilder.addNode("evaluate", createEvaluateNode(cfg))

    graphBuilder.addEdge(START, "classify")
    graphBuilder.addEdge("classify", "cache")
    graphBuilder.addConditionalEdges("cache", (state: ReasonGraphStateType) => state.result ? "done" : "continue", {
        done: END,
        continue: "quick"
    })
    graphBuilder.addConditionalEdges("quick", (state: ReasonGraphStateType) => state.result ? "done" : "structure", {
        done: END,
        structure: "structure"
    })
    graphBuilder.addEdge("structure", "solve")
    graphBuilder.addEdge("solve", "evaluate")
    graphBuilder.addEdge("evaluate", END)

    return graphBuilder.compile({
        checkpointer: cfg.graph?.checkpoint ? new MemorySaver() : undefined,
        name: "openreason-langgraph"
    })
}

export const reason_with_langgraph = async (query: string, cfg: openreason_config): Promise<reasoning_result | null> => {
    try {
        const graph = buildGraph(cfg)
        const threadPrefix = cfg.graph?.threadPrefix || "openreason"
        const state = await graph.invoke({ query, startTime: Date.now() }, { configurable: { thread_id: `${threadPrefix}-${Date.now()}` } })
        if (state?.result) {
            log_info("[LANGGRAPH] pipeline complete")
            return state.result
        }
        return null
    } catch (error) {
        log_error("[LANGGRAPH] pipeline error", error)
        return null
    }
}
