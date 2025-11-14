import { openreason_config } from "./init"
import { detect_domain, select_mode, estimate_complexity } from "./router"
import { build_prompt } from "./prompt"
import { invoke_provider } from "../api/provider"
import { evaluate } from "./evaluator"
import { store_trace, get_similar_traces } from "./memory"
import { evolve_prompt } from "./evolve"
import { log_info } from "./logger"

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

export const reason = async (query: string, cfg: openreason_config): Promise<reasoning_result> => {
    const start = Date.now()

    const domain = detect_domain(query)
    const mode = select_mode(query, domain)

    log_info(`[REASON] domain=${domain}, mode=${mode}`)

    const similar = cfg.memory?.enabled ? await get_similar_traces(query, 3) : []
    const context = similar.length > 0
        ? `Similar past reasoning:\n${similar.map((s: any, i: number) => `${i + 1}. ${s.query} -> ${s.verdict}`).join("\n")}`
        : undefined

    const prompt = build_prompt(query, mode, domain, context)

    const model_choice = mode === "reflex"
        ? cfg.simpleModel!
        : mode === "reflective"
            ? cfg.complexModel!
            : cfg.model

    const response = await invoke_provider(
        prompt,
        cfg.provider,
        cfg.apiKey,
        model_choice,
        cfg.performance?.timeout || 30000
    )

    const evaluation = await evaluate(response, query, domain, mode)

    const latency = Date.now() - start

    const result: reasoning_result = {
        verdict: response,
        confidence: evaluation.confidence,
        mode,
        domain,
        complexity: estimate_complexity(query),
        violations: 0,
        latency,
        metadata: {
            accuracy: evaluation.accuracy,
            compliance: evaluation.compliance,
            model: model_choice
        }
    }

    if (cfg.memory?.enabled) {
        await store_trace({
            query,
            verdict: response,
            confidence: evaluation.confidence,
            mode,
            domain,
            accuracy: evaluation.accuracy,
            latency
        })
    }

    const evolution_step = await evolve_prompt({ accuracy: evaluation.accuracy, compliance: evaluation.compliance, latency })
    if (evolution_step > 0) {
        result.evolutionStep = evolution_step
    }

    log_info(`[REASON] complete - confidence=${result.confidence.toFixed(2)}, latency=${latency}ms`)

    return result
}
