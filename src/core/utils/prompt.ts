import { mode, domain } from "../config/router"
import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { vectorize } from "../../utils/vectorize"
import { similarity } from "../../utils/similarity"

const default_reflex = `Answer precisely with no reasoning unless ambiguity exists. Be direct and concise.`
const default_analytic = `Reason step-by-step. Label each step as [Step 1], [Step 2], etc. Show your logical progression.`
const default_reflective = `Analyze implications, ethics, and causal outcomes. Use logic trees. Consider multiple perspectives before concluding.`

let mutation_version = 0

// Active prompt seeds loaded from public/prompt.json (system templates)
type prompt_seed = {
    id: string
    title: string
    system: string
    tokens: string[]
    vec: number[]
    domainHints: domain[]
}

let prompt_seeds: prompt_seed[] = []
let active_seed: prompt_seed | null = null

// Core mode prompt templates (will be combined with selected seed)
let PROMPTS: Record<mode, string> = {
    reflex: default_reflex,
    analytic: default_analytic,
    reflective: default_reflective
}

const load_prompt_seeds = () => {
    if (prompt_seeds.length > 0) return
    try {
        const file = path.resolve(process.cwd(), "public", "prompt.json")
        const raw = readFileSync(file, "utf-8")
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
            prompt_seeds = data
                .map((record: any) => {
                    if (!record || typeof record.system !== "string") return null
                    const rawSystem = record.system.trim()
                    const idx = rawSystem.toLowerCase().indexOf("now answer:")
                    const baseSystem = idx >= 0 ? rawSystem.substring(0, idx).trim() : rawSystem
                    const combined = `${record.title || ""} ${baseSystem}`.toLowerCase()
                    const domainHints: domain[] = []
                    if (/math|graph|number|proof|series|limit|geometry/.test(combined)) domainHints.push("math")
                    if (/logic|syllogism|paradox|quantifier|contradiction/.test(combined)) domainHints.push("logic")
                    if (/ethic|moral|trolley|fair/.test(combined)) domainHints.push("ethics")
                    if (/cause|causal|counterfactual|dag/.test(combined)) domainHints.push("causal")
                    if (/identity|philos|ontology|metaphys|conscious/.test(combined)) domainHints.push("philosophy")
                    const tokens = combined.split(/[^a-z0-9]+/).filter(Boolean)
                    const seed: prompt_seed = {
                        id: record.id || "seed",
                        title: record.title || record.id || "seed",
                        system: baseSystem,
                        tokens,
                        vec: vectorize(baseSystem),
                        domainHints: domainHints.length > 0 ? domainHints : ["general"]
                    }
                    return seed
                })
                .filter(Boolean) as prompt_seed[]
        }
    } catch {
        prompt_seeds = []
    }
}

const choose_active_seed = (query: string, reasoning_domain: domain) => {
    load_prompt_seeds()
    if (prompt_seeds.length === 0) return null
    const qVec = vectorize(query)
    let best = prompt_seeds[0]
    let bestScore = -Infinity
    const qTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

    for (const seed of prompt_seeds) {
        const overlap = seed.tokens.filter(t => qTokens.includes(t)).length
        const sim = similarity(qVec, seed.vec)
        const domainBoost = seed.domainHints.includes(reasoning_domain) ? 0.3 : 0
        const score = overlap * 0.05 + sim + domainBoost
        if (score > bestScore) {
            bestScore = score
            best = seed
        }
    }
    active_seed = best
    return active_seed
}

const persist_evolved_prompt = (modeChanged: mode) => {
    try {
        const file = path.resolve(process.cwd(), "public", "prompt.json")
        const raw = readFileSync(file, "utf-8")
        const data = JSON.parse(raw)
        if (Array.isArray(data)) {
            data.push({
                id: `evolved_v${mutation_version}_${modeChanged}`,
                title: `evolved ${modeChanged} template v${mutation_version}`,
                system: PROMPTS[modeChanged]
            })
            writeFileSync(file, JSON.stringify(data, null, 2))
        }
    } catch {
        // swallow persistence errors silently
    }
}

export const get_prompt_version = () => mutation_version

export const mutate_prompts = (avg: { accuracy: number; compliance: number; latency: number }) => {
    // Simple adaptive mutations
    const add = (base: string, addition: string) => (base.includes(addition) ? base : `${base} ${addition}`)

    if (avg.accuracy < 0.8) {
        PROMPTS.analytic = add(PROMPTS.analytic, "Use numbered, atomic steps and check each step.")
        PROMPTS.reflective = add(PROMPTS.reflective, "Map alternatives; justify the final choice explicitly.")
    }
    if (avg.compliance < 0.85) {
        PROMPTS.reflex = add(PROMPTS.reflex, "Keep under 2 sentences unless clarification is required.")
        PROMPTS.analytic = add(PROMPTS.analytic, "Limit to the minimal steps necessary.")
    }
    if (avg.latency > 1500) {
        PROMPTS.reflective = add(PROMPTS.reflective, "Be succinct; prefer bullets over paragraphs.")
    }
    mutation_version += 1
    // Persist evolved analytic & reflective templates for future runs
    persist_evolved_prompt("analytic")
    persist_evolved_prompt("reflective")
    return mutation_version
}

export const build_prompt = (query: string, reasoning_mode: mode, reasoning_domain: domain, context?: string): string => {
    if (!active_seed || active_seed.domainHints.length === 0 || !active_seed.domainHints.includes(reasoning_domain)) {
        choose_active_seed(query, reasoning_domain)
    }
    const seedText = active_seed ? `${active_seed.system}\n` : ""
    const system_prompt = `${seedText}${PROMPTS[reasoning_mode]}`

    const domain_context = domain_enhancements[reasoning_domain] || ""

    const full_prompt = `${system_prompt}

Domain: ${reasoning_domain}
Mode: ${reasoning_mode}
${domain_context}

${context ? `Context: ${context}\n\n` : ""}Query: ${query}`

    return full_prompt
}

const domain_enhancements: Record<domain, string> = {
    math: "Use symbolic notation. Show algebraic steps. Verify results.",
    logic: "Identify premises. Apply inference rules. Check validity.",
    causal: "Map cause-effect chains. Check temporal ordering. Consider counterfactuals.",
    philosophy: "Define terms. Consider multiple frameworks. Address paradoxes.",
    ethics: "Apply utilitarian, deontological, and virtue ethics frameworks. Balance competing values.",
    general: ""
}
