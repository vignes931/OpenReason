import { loadMemory } from "./memory"
import { reason } from "./reason"

export type openreason_config = {
    provider: "openai" | "anthropic" | "google" | "xai"
    apiKey: string
    model: string
    simpleModel?: string
    complexModel?: string
    weights?: {
        logical?: number
        rule?: number
        empathy?: number
    }
    memory?: {
        enabled: boolean
        path: string
    }
    performance?: {
        maxRetries?: number
        timeout?: number
    }
}

let cfg: openreason_config = {
    provider: "openai",
    apiKey: "",
    model: "gpt-4o"
}

export const init = (config: openreason_config) => {
    cfg = {
        ...config,
        weights: config.weights || { logical: 0.4, rule: 0.4, empathy: 0.2 },
        simpleModel: config.simpleModel || config.model,
        complexModel: config.complexModel || config.model,
        memory: config.memory || { enabled: false, path: "./data/memory.db" },
        performance: config.performance || { maxRetries: 3, timeout: 30000 }
    }

    if (cfg.memory?.enabled) {
        // fire-and-forget async initialization
        Promise.resolve(loadMemory(cfg.memory.path)).catch(() => { })
    }
}

export const get_config = () => cfg

export default {
    init,
    async reason(query: string) {
        return await reason(query, cfg)
    }
}
