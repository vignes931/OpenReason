import { vectorize } from "../utils/vectorize"
import Keyv from "keyv"
import KeyvSqlite from "@keyv/sqlite"

type trace = {
    query: string
    verdict: string
    confidence: number
    mode: string
    domain: string
    accuracy: number
    latency: number
    timestamp: number
}

let memory_store: trace[] = []
let memory_path = "./data/memory.db"
let keyv: Keyv<any> | null = null

export const loadMemory = async (path: string) => {
    memory_path = path
    const uri = `sqlite://${path}`
    keyv = new Keyv({ store: new KeyvSqlite({ uri }) })

    memory_store = []

    try {
        // keyv iterator to load existing traces
        // keys are prefixed with "trace:"
        if ((keyv as any).iterator) {
            for await (const [key, value] of (keyv as any).iterator()) {
                if (typeof key === "string" && key.startsWith("trace:")) {
                    memory_store.push(value as trace)
                }
            }
        }
    } catch {
        memory_store = []
    }
}

export const store_trace = async (t: Omit<trace, "timestamp">) => {
    const item: trace = {
        ...t,
        timestamp: Date.now()
    }

    memory_store.push(item)

    if (memory_store.length > 1000) {
        memory_store = memory_store.slice(-1000)
    }

    try {
        if (keyv) {
            const key = `trace:${item.timestamp}`
            await keyv.set(key, item)
        }
    } catch {
        // ignore persistence errors
    }
}

export const get_similar_traces = async (query: string, limit: number = 5): Promise<trace[]> => {
    if (memory_store.length === 0) return []

    const query_vec = vectorize(query)
    const scores = memory_store.map(t => ({
        trace: t,
        score: cosine_similarity(query_vec, vectorize(t.query))
    }))

    scores.sort((a, b) => b.score - a.score)
    return scores.slice(0, limit).map(s => s.trace)
}

const cosine_similarity = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const mag_a = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const mag_b = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return mag_a && mag_b ? dot / (mag_a * mag_b) : 0
}

export const get_memory_stats = () => {
    return {
        total_traces: memory_store.length,
        avg_confidence: memory_store.reduce((sum, t) => sum + t.confidence, 0) / memory_store.length || 0,
        avg_latency: memory_store.reduce((sum, t) => sum + t.latency, 0) / memory_store.length || 0
    }
}
