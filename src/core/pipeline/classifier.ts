import { detect_domain, domain } from "../config/router"

export type ClassificationType = "simple" | "complex" | "abstract" | "math" | "logic" | "ethics"

export type ClassificationResult = {
    type: ClassificationType
    difficulty: 1 | 2 | 3 | 4 | 5
    requiredDepth: 1 | 2 | 3
    mustStopReasoning: boolean
    domain: domain
}

const numericExpression = /^(?:[-+]?\d+(?:\.\d+)?\s*[+\-*/\^]\s*)+[-+]?\d+(?:\.\d+)?$/

export const classify_query = (query: string): ClassificationResult => {
    const tokens = query.trim().split(/\s+/).filter(Boolean)
    const lengthScore = tokens.length
    const normalized = query.toLowerCase()
    const domain = detect_domain(query)

    let type: ClassificationType = "complex"
    if (domain === "math") type = "math"
    else if (domain === "logic") type = "logic"
    else if (domain === "ethics") type = "ethics"
    else if (/paradox|conscious|identity|abstract/.test(normalized)) type = "abstract"
    else type = "complex"

    if (lengthScore <= 8 && /\d/.test(query) && !/[?]/.test(query)) {
        type = "simple"
    }

    let difficulty: 1 | 2 | 3 | 4 | 5 = 2
    if (lengthScore <= 6) difficulty = 1
    if (/[?]/.test(query) || /(why|how|prove|justify|demonstrate|show)/.test(normalized)) difficulty = (difficulty < 3 ? 3 : difficulty)
    if (/(paradox|consistency|self-modify|alignment)/.test(normalized)) difficulty = 4
    if (/(research-level|open problem|formal proof)/.test(normalized)) difficulty = 5
    if (domain === "math" && /(inequality|matrix|diophantine|integral)/.test(normalized)) difficulty = Math.max(difficulty, 4) as 4 | 5

    let requiredDepth: 1 | 2 | 3 = 2
    if (difficulty <= 2) requiredDepth = 1
    if (difficulty >= 4) requiredDepth = 3
    if (domain === "ethics" || domain === "philosophy") requiredDepth = Math.max(requiredDepth, 3) as 3

    const mustStopReasoning = type === "simple" && (numericExpression.test(normalized.replace(/\s+/g, "")) || tokens.length <= 5)

    return {
        type,
        difficulty,
        requiredDepth,
        mustStopReasoning,
        domain
    }
}
