import { ClassificationResult } from "./classifier"
import { ReasoningSkeleton } from "./skeleton"
import { SolvedStep } from "./solver"
import { VerificationResult } from "../verification/verifier"

export type FinalizerPayload = {
    query: string
    classification: ClassificationResult
    skeleton: ReasoningSkeleton
    solved: SolvedStep[]
    verification: VerificationResult
    retries: number
}

export type FinalizerResult = {
    verdict: string
    reasoning: string
    passedChecks: string[]
    failedChecks: string[]
    confidence: number
    mode: "reflex" | "analytic" | "reflective"
}

const depth_to_mode = (depth: number): "reflex" | "analytic" | "reflective" => {
    if (depth <= 1) return "reflex"
    if (depth === 2) return "analytic"
    return "reflective"
}

export const finalize_reasoning = (payload: FinalizerPayload): FinalizerResult => {
    const { classification, skeleton, solved, verification, retries } = payload
    const mode = depth_to_mode(classification.requiredDepth)

    const stepsText = solved
        .map((step, idx) => `Step ${idx + 1}: ${step.content}`)
        .join("\n\n")

    const conclusion = solved[solved.length - 1]?.content || skeleton.claim

    const reasoning = `Problem Class: ${classification.type.toUpperCase()}
Difficulty: ${classification.difficulty}
Mode: ${mode}

${stepsText}

Conclusion:
${conclusion}

Checks:
Passed: ${verification.passedChecks.join(", ") || "None"}
Failed: ${verification.failedChecks.join(", ") || "None"}`

    const baseConfidence = verification.score
    const retryPenalty = Math.min(retries * 0.1, 0.2)
    const confidence = Math.max(0.4, Math.min(0.98, baseConfidence + 0.3 - retryPenalty))

    return {
        verdict: reasoning,
        reasoning,
        passedChecks: verification.passedChecks,
        failedChecks: verification.failedChecks,
        confidence,
        mode
    }
}
