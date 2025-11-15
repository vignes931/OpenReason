import { openreason_config } from "../config/init"
import { ClassificationResult } from "./classifier"
import { invoke_provider } from "../../api/provider"

export type ReasoningSkeleton = {
    claim: string
    substeps: string[]
    expectedChecks: string[]
}

const DEFAULT_SUBSTEPS = [
    "Restate the question and key variables",
    "Identify governing constraints or assumptions",
    "Apply the relevant method or principle",
    "Validate the result against the constraints",
    "State the conclusion"
]

const parse_json_block = (raw: string): any | null => {
    try {
        const fenceMatch = raw.match(/```json([\s\S]*?)```/i)
        const jsonText = fenceMatch ? fenceMatch[1] : raw
        const balanced = jsonText.trim().replace(/^[^{]*({[\s\S]*})[^}]*$/, "$1")
        return JSON.parse(balanced)
    } catch {
        return null
    }
}

export const generate_skeleton = async (
    query: string,
    classification: ClassificationResult,
    cfg: openreason_config,
    context?: string
): Promise<ReasoningSkeleton> => {
    const systemPrompt = `You are an expert reasoning planner. Your job is to produce a concise reasoning skeleton in JSON.
Return an object with keys claim, substeps (array of 3-6 imperative steps), expectedChecks (array).
Do NOT provide any reasoning details.`

    const request = `${systemPrompt}

Problem:
${query}

Classification:
- type: ${classification.type}
- difficulty: ${classification.difficulty}
- depth: ${classification.requiredDepth}
${context ? `- context: ${context}` : ""}

Respond ONLY with JSON.`

    const model = classification.requiredDepth >= 3 ? cfg.complexModel ?? cfg.model : cfg.model

    let parsed: any | null = null
    try {
        const raw = await invoke_provider(
            request,
            cfg.provider,
            cfg.apiKey,
            model,
            cfg.performance?.timeout || 30000
        )
        parsed = parse_json_block(raw)
    } catch {
        parsed = null
    }

    if (!parsed || !Array.isArray(parsed?.substeps) || parsed.substeps.length === 0) {
        return {
            claim: parsed?.claim || `Resolve: ${query}`,
            substeps: DEFAULT_SUBSTEPS.slice(0, classification.requiredDepth === 1 ? 3 : DEFAULT_SUBSTEPS.length),
            expectedChecks: [
                "No contradictions",
                "All constraints satisfied",
                "Result matches query requirements"
            ]
        }
    }

    const substeps = parsed.substeps
        .map((s: string) => s?.trim())
        .filter((s: string) => s && s.length > 0)

    const checks = Array.isArray(parsed.expectedChecks)
        ? parsed.expectedChecks.map((s: string) => s?.trim()).filter((s: string) => s && s.length > 0)
        : []

    return {
        claim: parsed.claim || `Resolve: ${query}`,
        substeps: substeps.length > 0 ? substeps : DEFAULT_SUBSTEPS,
        expectedChecks: checks.length > 0 ? checks : ["No contradictions", "Final answer stated"]
    }
}
