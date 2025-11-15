import { openreason_config } from "../config/init"
import { ClassificationResult } from "./classifier"
import { ReasoningSkeleton } from "./skeleton"
import { invoke_provider } from "../../api/provider"

export type SolvedStep = {
    title: string
    content: string
}

export type SolverResult = {
    steps: SolvedStep[]
    scratchpad: string[]
}

type SolveOptions = {
    context?: string
    corrections?: string[]
}

const build_step_prompt = (
    query: string,
    skeleton: ReasoningSkeleton,
    classification: ClassificationResult,
    stepIndex: number,
    priorSteps: SolvedStep[],
    options?: SolveOptions
): string => {
    const instructions = skeleton.substeps[stepIndex]
    const prior = priorSteps
        .map((step, idx) => `Step ${idx + 1}: ${step.content}`)
        .join("\n") || "None yet"

    const correctionText = options?.corrections?.length
        ? `Known issues to avoid:\n- ${options.corrections.join("\n- ")}`
        : ""

    return `You are executing step ${stepIndex + 1} of ${skeleton.substeps.length} for the problem below.
Follow the provided instruction exactly. Do not rewrite previous steps.

Problem: ${query}
Current instruction: ${instructions}
Overall claim: ${skeleton.claim}
Classification: type=${classification.type}, difficulty=${classification.difficulty}, depth=${classification.requiredDepth}
Prior steps:\n${prior}
Expected checks:\n- ${skeleton.expectedChecks.join("\n- ")}
${correctionText}

Respond with:
Step ${stepIndex + 1}: <concise reasoning for this instruction>
` }

export const solve_skeleton = async (
    query: string,
    skeleton: ReasoningSkeleton,
    classification: ClassificationResult,
    cfg: openreason_config,
    options?: SolveOptions
): Promise<SolverResult> => {
    const solved: SolvedStep[] = []
    const scratchpad: string[] = []
    const depthModel = classification.requiredDepth >= 3 ? cfg.complexModel ?? cfg.model : cfg.model
    const maxRetries = 2

    for (let i = 0; i < skeleton.substeps.length; i++) {
        let attempt = 0
        let content = ""
        while (attempt <= maxRetries && !content) {
            attempt += 1
            try {
                const prompt = build_step_prompt(query, skeleton, classification, i, solved, options)
                const raw = await invoke_provider(
                    prompt,
                    cfg.provider,
                    cfg.apiKey,
                    depthModel,
                    cfg.performance?.timeout || 30000
                )
                const match = raw.match(new RegExp(`Step ${i + 1}:(.*)`, "i"))
                content = match ? match[1].trim() : raw.trim()
                scratchpad.push(`step_${i + 1}_attempt_${attempt}: ${raw.trim()}`)
            } catch (err) {
                scratchpad.push(`step_${i + 1}_error_${attempt}: ${(err as Error).message}`)
                content = ""
            }
        }

        if (!content) {
            content = `Unable to complete instruction "${skeleton.substeps[i]}"; fallback explanation provided.`
        }

        solved.push({
            title: `Step ${i + 1}`,
            content
        })
    }

    return { steps: solved, scratchpad }
}
