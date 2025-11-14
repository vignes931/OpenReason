import { domain, mode } from "./router"

export type evaluation = {
    accuracy: number
    compliance: number
    confidence: number
}

export const evaluate = async (response: string, query: string, reasoning_domain: domain, reasoning_mode: mode): Promise<evaluation> => {
    let accuracy = 0.7
    let compliance = 0.8

    if (reasoning_domain === "math") {
        accuracy = evaluate_math(response, query)
    } else if (reasoning_domain === "logic") {
        accuracy = evaluate_logic(response)
    } else if (reasoning_domain === "ethics" || reasoning_domain === "philosophy") {
        accuracy = evaluate_philosophical(response)
    }

    compliance = evaluate_compliance(response, reasoning_mode)

    const confidence = calculate_confidence(accuracy, compliance)

    return { accuracy, compliance, confidence }
}

const evaluate_math = (response: string, query: string): number => {
    if (/\d+/.test(response) && /\d+/.test(query)) {
        return 0.95
    }
    if (response.includes("=") || response.includes("therefore") || response.includes("proof")) {
        return 0.85
    }
    return 0.7
}

const evaluate_logic = (response: string): number => {
    const has_structure = /step|premise|conclusion|therefore/i.test(response)
    const has_logic = /implies|entails|valid|sound/i.test(response)

    if (has_structure && has_logic) return 0.9
    if (has_structure || has_logic) return 0.75
    return 0.6
}

const evaluate_philosophical = (response: string): number => {
    const has_frameworks = /utilitarian|deontological|virtue|kantian/i.test(response)
    const has_analysis = /consider|perspective|argument|implication/i.test(response)

    if (has_frameworks && has_analysis) return 0.85
    if (has_frameworks || has_analysis) return 0.7
    return 0.6
}

const evaluate_compliance = (response: string, reasoning_mode: mode): number => {
    const length = response.length

    if (reasoning_mode === "reflex") {
        return length < 300 ? 1.0 : 0.7
    }

    if (reasoning_mode === "analytic") {
        const has_steps = /step \d+|step-\d+|\[\d+\]/i.test(response)
        return has_steps ? 0.95 : 0.6
    }

    if (reasoning_mode === "reflective") {
        const has_depth = length > 500 && /because|therefore|implies|consider/gi.test(response)
        return has_depth ? 0.9 : 0.65
    }

    return 0.7
}

const calculate_confidence = (accuracy: number, compliance: number): number => {
    return 0.6 * accuracy + 0.4 * compliance
}
