import { domain } from "../config/router"

export type ProblemStructure = {
    type: "diophantine" | "inequality" | "eigenvalue" | "paradox" | "trolley" | "causal_loop" | "identity" | "general"
    hasSymmetry: boolean
    hasConstraints: boolean
    requiresProof: boolean
    requiresCounterfactual: boolean
    patternConfidence: number
}

const patterns = {
    diophantine: [/x\^?\d+.*=.*\d+/, /integer solutions?/, /x⁴|y⁴|z²/],
    inequality: [/≥|≤|>=|<=/, /prove that.*≥/, /tr\(/, /λ/],
    eigenvalue: [/eigenvalue/, /λ.*max/, /matrix/, /tr\(/],
    paradox: [/paradox/, /contradict/, /impossible/, /self.*referenc/],
    trolley: [/trolley/, /save.*person/, /moral.*worth/, /utilitarian/],
    causal_loop: [/cause.*never/, /message.*past/, /timeline/, /bootstrap/],
    identity: [/identity/, /original/, /copy/, /consciousness/]
}

const symmetryMarkers = [/symmetric/, /a = b = c/, /invariant/, /permutation/]
const constraintMarkers = [/constraint/, /satisf/, /subject to/, /given that/]
const proofMarkers = [/prove/, /show that/, /demonstrate/, /justify/]
const counterfactualMarkers = [/if.*would/, /suppose/, /what if/, /had.*not/]

export const detect_structure = (query: string, detectedDomain: domain): ProblemStructure => {
    const norm = query.toLowerCase()
    let type: ProblemStructure["type"] = "general"
    let maxScore = 0

    for (const [key, regexList] of Object.entries(patterns)) {
        const score = regexList.filter(rx => rx.test(norm)).length
        if (score > maxScore) {
            maxScore = score
            type = key as ProblemStructure["type"]
        }
    }

    const hasSymmetry = symmetryMarkers.some(rx => rx.test(norm))
    const hasConstraints = constraintMarkers.some(rx => rx.test(norm))
    const requiresProof = proofMarkers.some(rx => rx.test(norm))
    const requiresCounterfactual = counterfactualMarkers.some(rx => rx.test(norm))
    const patternConfidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.3

    return {
        type,
        hasSymmetry,
        hasConstraints,
        requiresProof,
        requiresCounterfactual,
        patternConfidence
    }
}
