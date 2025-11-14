import { vectorize } from "../utils/vectorize"
import { similarity } from "../utils/similarity"

export type domain = "math" | "logic" | "causal" | "philosophy" | "ethics" | "general"
export type mode = "reflex" | "analytic" | "reflective"

const domain_patterns: Record<domain, string[]> = {
    math: ["number", "calculate", "prove", "equation", "theorem", "integral", "derivative", "sum", "multiply"],
    logic: ["if", "then", "implies", "therefore", "not", "and", "or", "valid", "sound", "entails"],
    causal: ["cause", "effect", "because", "leads to", "results in", "if would", "counterfactual"],
    philosophy: ["exist", "consciousness", "identity", "truth", "knowledge", "reality", "being", "essence"],
    ethics: ["should", "ought", "moral", "ethical", "right", "wrong", "justice", "virtue", "duty"],
    general: []
}

export const detect_domain = (query: string): domain => {
    const lower = query.toLowerCase()
    let max_score = 0
    let best_domain: domain = "general"

    for (const [dom, patterns] of Object.entries(domain_patterns)) {
        if (dom === "general") continue
        const score = patterns.filter(p => lower.includes(p)).length
        if (score > max_score) {
            max_score = score
            best_domain = dom as domain
        }
    }

    return best_domain
}

export const select_mode = (query: string, domain: domain): mode => {
    const complexity = estimate_complexity(query)

    if (complexity < 0.3 && (domain === "math" || domain === "general")) {
        return "reflex"
    }

    if (complexity < 0.6 && (domain === "math" || domain === "logic")) {
        return "analytic"
    }

    return "reflective"
}

export const estimate_complexity = (query: string): number => {
    const tokens = query.split(/\s+/)
    const length_score = Math.min(tokens.length / 50, 1) * 0.3

    const keyword_score = (
        (query.match(/why|how|explain|analyze/gi) || []).length * 0.1 +
        (query.match(/prove|demonstrate|justify/gi) || []).length * 0.15
    )

    const structure_score = (query.match(/[;:,]/g) || []).length * 0.05

    return Math.min(length_score + keyword_score + structure_score, 1)
}
