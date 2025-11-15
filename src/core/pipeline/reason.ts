import { openreason_config } from "../config/init"
import { estimate_complexity, mode, domain } from "../config/router"
import { invoke_provider } from "../../api/provider"
import { evaluate } from "../verification/evaluator"
import { store_trace, get_similar_traces } from "../utils/memory"
import { evolve_prompt } from "../utils/evolve"
import { log_info } from "../utils/logger"
import { unified_quality } from "../utils/metrics"
import { similarity } from "../../utils/similarity"
import { vectorize } from "../../utils/vectorize"
import { solveMath } from "../../engines/math"
import { assessLogic } from "../../engines/logic"
import { reasonEthics } from "../../engines/ethics"
import { analyzeCausal } from "../../engines/causal"
import { classify_query } from "./classifier"
import { detect_structure } from "../utils/structure"
import { decompose_problem } from "./decompose"
import { generate_formal_skeleton } from "../verification/formal"
import { generate_skeleton } from "./skeleton"
import { solve_skeleton } from "./solver"
import { verify_solution } from "../verification/verifier"
import { verify_math_reasoning, verify_logic_consistency } from "../verification/verify"
import { repair_reasoning, RepairInstruction } from "../verification/repair"
import { unify_steps } from "../utils/unify"
import { finalize_reasoning } from "./finalizer"

export type reasoning_result = {
    verdict: string
    confidence: number
    mode: string
    domain: string
    complexity?: number
    violations?: number
    evolutionStep?: number
    latency: number
    metadata?: any
}

const depth_to_mode = (depth: number): mode => {
    if (depth <= 1) return "reflex"
    if (depth === 2) return "analytic"
    return "reflective"
}

const quick_respond = async (query: string, cfg: openreason_config, detectedDomain: domain): Promise<string> => {
    let det: string | null = null
    if (detectedDomain === "math") det = solveMath(query)
    else if (detectedDomain === "logic") det = assessLogic(query)
    else if (detectedDomain === "ethics") det = reasonEthics(query)
    else if (detectedDomain === "causal") det = analyzeCausal(query)

    if (det) {
        return det
    }

    const prompt = `Answer the following question in one or two sentences with no intermediate reasoning unless absolutely necessary:\n${query}`
    return invoke_provider(
        prompt,
        cfg.provider,
        cfg.apiKey,
        cfg.simpleModel ?? cfg.model,
        cfg.performance?.timeout || 20000
    )
}

export const reason = async (query: string, cfg: openreason_config): Promise<reasoning_result> => {
    const start = Date.now()

    const classification = classify_query(query)
    const domain = classification.domain
    const pipelineMode = depth_to_mode(classification.requiredDepth)

    log_info(`[REASON] classify type=${classification.type} domain=${domain} depth=${classification.requiredDepth}`)

    const similar = cfg.memory?.enabled ? await get_similar_traces(query, 3) : []

    if (similar.length > 0) {
        const qv = vectorize(query)
        const best = similar[0]
        const score = similarity(qv, vectorize(best.query))
        const hasStrongAccuracy = typeof best.accuracy === "number" && best.accuracy >= 0.85
        const hasStrongConfidence = typeof best.confidence === "number" && best.confidence >= 0.8
        if (score >= 0.9 && hasStrongAccuracy && hasStrongConfidence && typeof (best as any).timestamp === "number" && (Date.now() - (best as any).timestamp) > 2000) {
            const latency = Date.now() - start
            const cachedResult: reasoning_result = {
                verdict: best.verdict,
                confidence: Math.min(1, best.confidence + 0.05),
                mode: "reflex",
                domain,
                complexity: estimate_complexity(query),
                violations: 0,
                latency,
                metadata: { cached: true, cacheSimilarity: score }
            }
            log_info(`[REASON] cache hit - sim=${score.toFixed(2)}`)
            return cachedResult
        }
    }

    if (classification.mustStopReasoning) {
        const quick = await quick_respond(query, cfg, domain)
        const evaluation = await evaluate(quick, query, domain, "reflex")
        const latency = Date.now() - start
        const Q = unified_quality(evaluation.accuracy, evaluation.compliance, 0, latency)
        const result: reasoning_result = {
            verdict: quick,
            confidence: evaluation.confidence,
            mode: "reflex",
            domain,
            complexity: estimate_complexity(query),
            violations: 0,
            latency,
            metadata: { quick: true, Q }
        }
        if (cfg.memory?.enabled) {
            await store_trace({
                query,
                verdict: quick,
                confidence: evaluation.confidence,
                mode: "reflex",
                domain,
                accuracy: evaluation.accuracy,
                latency
            })
        }
        return result
    }

    const context = similar.length > 0
        ? `Similar past reasoning:\n${similar.map((s: any, i: number) => `${i + 1}. ${s.query} -> ${s.verdict}`).join("\n")}`
        : undefined

    log_info(`[REASON] detecting structure`)
    const structure = detect_structure(query, domain)
    const decomp = decompose_problem(query, structure)
    const formal = generate_formal_skeleton(structure, decomp)

    log_info(`[REASON] structure=${structure.type} schema=${formal.schema}`)

    const skeleton = await generate_skeleton(query, classification, cfg, context)
    let solverResult = await solve_skeleton(query, skeleton, classification, cfg)
    let verification = await verify_solution(query, skeleton, solverResult.steps, classification, cfg)

    const allSteps = solverResult.steps.map(s => s.content)
    const mathVerif = verify_math_reasoning(allSteps.join("\n"), structure)
    const logicVerif = verify_logic_consistency(allSteps.join("\n"))


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
        const repaired = await repair_reasoning(allSteps.join("\n"), repairInstructions, cfg)
        if (repaired.success) {
            solverResult.steps = repaired.repaired.split(/\n\n+/).map((content, idx) => ({ title: `Step ${idx + 1}`, content }))
            verification = await verify_solution(query, skeleton, solverResult.steps, classification, cfg)
        }
    }

    const unified = unify_steps(solverResult.steps.map(s => s.content))

    const finalized = finalize_reasoning({
        query,
        classification,
        skeleton,
        solved: solverResult.steps,
        verification,
        retries
    })

    const evaluation = await evaluate(finalized.verdict, query, domain, finalized.mode as mode)
    const latency = Date.now() - start
    const Q = unified_quality(evaluation.accuracy, evaluation.compliance, verification.score, latency)

    const result: reasoning_result = {
        verdict: unified.unified || finalized.verdict,
        confidence: Math.min(finalized.confidence, unified.coherence),
        mode: finalized.mode,
        domain,
        complexity: estimate_complexity(query),
        violations: verification.issues.length + (!mathVerif.passed ? 1 : 0) + (!logicVerif.passed ? 1 : 0),
        latency,
        metadata: {
            accuracy: evaluation.accuracy,
            compliance: evaluation.compliance,
            verificationScore: verification.score,
            mathVerification: mathVerif,
            logicVerification: logicVerif,
            coherence: unified.coherence,
            structure: structure.type,
            schema: formal.schema,
            passedChecks: finalized.passedChecks,
            failedChecks: finalized.failedChecks,
            issues: verification.issues,
            retries,
            Q
        }
    }

    if (cfg.memory?.enabled) {
        await store_trace({
            query,
            verdict: finalized.verdict,
            confidence: finalized.confidence,
            mode: finalized.mode,
            domain,
            accuracy: evaluation.accuracy,
            latency
        })
    }

    const evolution_step = await evolve_prompt({ accuracy: evaluation.accuracy, compliance: evaluation.compliance, latency })
    if (evolution_step > 0) {
        result.evolutionStep = evolution_step
    }

    log_info(`[REASON] pipeline complete - confidence=${result.confidence.toFixed(2)}, latency=${latency}ms, retries=${retries}`)

    return result
}
