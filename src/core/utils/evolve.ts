type performance_metrics = {
    accuracy: number
    compliance: number
    latency: number
}

let evolution_counter = 0
let performance_history: performance_metrics[] = []

const alpha = 0.4
const beta = 0.3
const gamma = 0.001
const theta = 0.1

import { mutate_prompts } from "./prompt"

export const evolve_prompt = async (metrics: performance_metrics): Promise<number> => {
    performance_history.push(metrics)

    if (performance_history.length < 10) {
        return 0
    }

    const recent = performance_history.slice(-10)
    const avg_accuracy = recent.reduce((sum, m) => sum + m.accuracy, 0) / recent.length
    const avg_compliance = recent.reduce((sum, m) => sum + m.compliance, 0) / recent.length
    const avg_latency = recent.reduce((sum, m) => sum + m.latency, 0) / recent.length

    const delta = alpha * (1 - avg_accuracy) + beta * (1 - avg_compliance) + gamma * avg_latency

    if (delta > theta) {
        evolution_counter++
        // mutate prompt templates based on recent averages
        mutate_prompts({ accuracy: avg_accuracy, compliance: avg_compliance, latency: avg_latency })
        performance_history = []
        return evolution_counter
    }

    return 0
}

export const get_evolution_stats = () => {
    return {
        evolution_count: evolution_counter,
        performance_history: performance_history.slice(-10)
    }
}
