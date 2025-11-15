import { openreason_config } from "../config/init"
import { invoke_provider } from "../../api/provider"

export type RepairInstruction = {
    step: number
    issue: string
    suggestion: string
}

export type RepairResult = {
    repaired: string
    changes: number
    success: boolean
}

const build_repair_prompt = (original: string, instructions: RepairInstruction[]): string => {
    const issueList = instructions.map(inst => `Step ${inst.step}: ${inst.issue} → ${inst.suggestion}`).join("\n")
    return `The following reasoning has issues. Fix them precisely without rewriting unrelated parts.

Original reasoning:
${original}

Issues to fix:
${issueList}

Provide the corrected reasoning with the same structure.`
}

export const repair_reasoning = async (
    original: string,
    instructions: RepairInstruction[],
    cfg: openreason_config
): Promise<RepairResult> => {
    if (instructions.length === 0) {
        return { repaired: original, changes: 0, success: true }
    }

    try {
        const prompt = build_repair_prompt(original, instructions)
        const fixed = await invoke_provider(
            prompt,
            cfg.provider,
            cfg.apiKey,
            cfg.simpleModel ?? cfg.model,
            Math.min(20000, cfg.performance?.timeout || 30000)
        )

        const changes = instructions.length
        const success = fixed.length > original.length * 0.5 && fixed.length < original.length * 2

        return {
            repaired: success ? fixed : original,
            changes: success ? changes : 0,
            success
        }
    } catch {
        return { repaired: original, changes: 0, success: false }
    }
}
