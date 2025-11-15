import { openreason_config } from "../config/init"
import { ClassificationResult } from "../pipeline/classifier"
import { ReasoningSkeleton } from "../pipeline/skeleton"
import { SolvedStep } from "../pipeline/solver"
import { invoke_provider } from "../../api/provider"

export type VerificationResult = {
    passed: boolean
    issues: string[]
    passedChecks: string[]
    failedChecks: string[]
    suggestions: string[]
    score: number
}

const detect_contradictions = (text: string): boolean => {
    const lowered = text.toLowerCase()
    return /(but this contradicts|however, this contradicts|cannot be both|leads to contradiction)/.test(lowered)
}

const simple_math_sanity = (text: string): boolean => {
    const equalsMatches = text.match(/=\s*[^=]+/g)
    if (!equalsMatches) return true
    return equalsMatches.length < 12
}

const call_critic = async (
    prompt: string,
    cfg: openreason_config
): Promise<string[]> => {
    try {
        const raw = await invoke_provider(
            prompt,
            cfg.provider,
            cfg.apiKey,
            cfg.simpleModel ?? cfg.model,
            Math.min(15000, cfg.performance?.timeout || 20000)
        )
        return raw
            .split(/\n|\r/)
            .map(line => line.trim().replace(/^[-*]\s*/, ""))
            .filter(Boolean)
    } catch {
        return []
    }
}

export const verify_solution = async (
    query: string,
    skeleton: ReasoningSkeleton,
    solved: SolvedStep[],
    classification: ClassificationResult,
    cfg: openreason_config
): Promise<VerificationResult> => {
    const joined = solved.map(step => step.content).join("\n")
    const issues: string[] = []
    const passedChecks: string[] = []
    const failedChecks: string[] = []

    skeleton.expectedChecks.forEach(check => {
        const normalized = check.toLowerCase()
        const satisfied = joined.toLowerCase().includes(normalized.split(" ")[0])
        if (satisfied) passedChecks.push(check)
        else failedChecks.push(check)
    })

    if (detect_contradictions(joined)) {
        issues.push("Detected potential contradiction in reasoning chain.")
    }

    if (!simple_math_sanity(joined)) {
        issues.push("Too many equality statements; possible unresolved algebra.")
    }

    if (solved.length !== skeleton.substeps.length) {
        issues.push("Number of solved steps does not match skeleton.")
    }

    const criticPrompt = `You are a strict verifier. Assess the reasoning below for the problem.
Problem: ${query}
Skeleton claim: ${skeleton.claim}
Steps:
${solved.map((s, i) => `Step ${i + 1}: ${s.content}`).join("\n")}
Checks: ${skeleton.expectedChecks.join(", ")}

List any critical issues in short bullet phrases. If none, respond with "OK".`

    const criticFindings = await call_critic(criticPrompt, cfg)
    const criticIssues = criticFindings.filter(line => line.toLowerCase() !== "ok")
    issues.push(...criticIssues)

    const suggestions = criticIssues.length ? criticIssues : failedChecks.map(check => `Address missing check: ${check}`)
    const maxScore = skeleton.expectedChecks.length || 1
    const checkScore = passedChecks.length / maxScore
    const penalty = issues.length ? Math.min(issues.length * 0.1, 0.4) : 0
    const score = Math.max(0, Math.min(1, checkScore - penalty))

    const passed = score >= 0.65 && issues.length === 0

    return {
        passed,
        issues,
        passedChecks,
        failedChecks,
        suggestions,
        score
    }
}
