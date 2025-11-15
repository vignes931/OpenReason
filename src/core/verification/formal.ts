import { ProblemStructure } from "../utils/structure"
import { DecompositionResult } from "../pipeline/decompose"

export type FormalSkeleton = {
    schema: "zf" | "hilbert" | "hoare" | "peano" | "lagrange" | "natural_deduction"
    assumptions: string[]
    derivation: string[]
    checks: string[]
    conclusion: string
}

const build_zf_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "zf",
    assumptions: decomp.constraints,
    derivation: decomp.steps,
    checks: ["No contradictions", "All axioms satisfied", "Boundary conditions checked"],
    conclusion: "Final statement follows from axioms"
})

const build_hilbert_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "hilbert",
    assumptions: decomp.constraints,
    derivation: decomp.steps.map((step, i) => `Axiom ${i + 1}: ${step}`),
    checks: ["Deduction rules applied correctly", "No circular reasoning"],
    conclusion: "Theorem proved via deductive steps"
})

const build_hoare_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "hoare",
    assumptions: [`Precondition: ${decomp.constraints.join(", ")}`],
    derivation: decomp.steps.map(step => `{P} ${step} {Q}`),
    checks: ["Precondition holds", "Postcondition derived", "No side effects"],
    conclusion: "Postcondition satisfied"
})

const build_peano_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "peano",
    assumptions: ["Base case defined", "Inductive hypothesis stated"],
    derivation: [
        "Base case: Verify for n=0 or n=1",
        "Inductive step: Assume P(k), prove P(k+1)",
        ...decomp.steps
    ],
    checks: ["Base case verified", "Inductive step valid"],
    conclusion: "Statement holds for all natural numbers"
})

const build_lagrange_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "lagrange",
    assumptions: decomp.constraints,
    derivation: [
        "Define objective function and constraints",
        "Construct Lagrangian",
        "Compute gradients and set to zero",
        "Solve for critical points",
        "Verify optimality conditions"
    ],
    checks: ["Constraints satisfied", "KKT conditions hold", "Solution is global"],
    conclusion: "Optimal solution derived"
})

const build_natural_deduction_skeleton = (decomp: DecompositionResult): FormalSkeleton => ({
    schema: "natural_deduction",
    assumptions: decomp.constraints,
    derivation: decomp.steps,
    checks: ["All inference rules valid", "No assumptions violated"],
    conclusion: "Conclusion follows from premises"
})

export const generate_formal_skeleton = (structure: ProblemStructure, decomp: DecompositionResult): FormalSkeleton => {
    if (structure.type === "inequality" && structure.hasSymmetry) {
        return build_hilbert_skeleton(decomp)
    }
    if (structure.type === "diophantine" || (structure.requiresProof && /integer|natural/.test(decomp.steps.join(" ")))) {
        return build_peano_skeleton(decomp)
    }
    if (structure.type === "eigenvalue" || structure.type === "inequality") {
        return build_lagrange_skeleton(decomp)
    }
    if (structure.type === "causal_loop" || structure.requiresCounterfactual) {
        return build_hoare_skeleton(decomp)
    }
    if (structure.type === "paradox") {
        return build_natural_deduction_skeleton(decomp)
    }
    return build_zf_skeleton(decomp)
}
