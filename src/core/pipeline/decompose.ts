import { ProblemStructure } from "../utils/structure"

export type DecompositionResult = {
    steps: string[]
    constraints: string[]
    invariants: string[]
    graph: { from: string; to: string; type: string }[]
}

const mathDecompTemplates: Record<string, string[]> = {
    diophantine: [
        "Identify the equation structure and target variables",
        "Apply modular arithmetic constraints",
        "Use descent or lattice reduction",
        "Check trivial solutions",
        "Verify all solutions exhaustively"
    ],
    inequality: [
        "State the inequality and boundary conditions",
        "Identify applicable theorems (Cauchy-Schwarz, AM-GM, Jensen)",
        "Apply algebraic manipulation",
        "Check equality conditions",
        "Conclude with rigorous justification"
    ],
    eigenvalue: [
        "State the matrix properties and constraints",
        "Apply spectral decomposition",
        "Use trace and eigenvalue relationships",
        "Verify bounds numerically or symbolically",
        "State final inequality with proof"
    ]
}

const logicDecompTemplates = [
    "Identify premises and logical operators",
    "Construct truth table or proof tree",
    "Apply inference rules (modus ponens, resolution)",
    "Check for contradictions",
    "State conclusion with justification"
]

const ethicsDecompTemplates = [
    "Identify moral principles at stake",
    "Map consequences for each action",
    "Apply utilitarian, deontological, and virtue frameworks",
    "Weigh conflicting values",
    "Justify final recommendation"
]

const causalDecompTemplates = [
    "Identify causal variables and relationships",
    "Construct causal graph (DAG or cyclic)",
    "Check for confounders or feedback loops",
    "Apply counterfactual reasoning",
    "Conclude with causal mechanism"
]

export const decompose_problem = (query: string, structure: ProblemStructure): DecompositionResult => {
    let steps: string[] = []

    if (structure.type in mathDecompTemplates) {
        steps = mathDecompTemplates[structure.type]
    } else if (structure.type === "paradox" || structure.type === "causal_loop") {
        steps = logicDecompTemplates
    } else if (structure.type === "trolley") {
        steps = ethicsDecompTemplates
    } else if (structure.type === "identity") {
        steps = causalDecompTemplates
    } else {
        steps = [
            "Parse the question and identify key components",
            "Apply relevant domain knowledge",
            "Construct a logical argument",
            "Verify consistency",
            "State the conclusion"
        ]
    }

    const constraints: string[] = []
    if (structure.hasConstraints) {
        constraints.push("Respect all stated constraints")
    }
    if (structure.hasSymmetry) {
        constraints.push("Preserve symmetry throughout reasoning")
    }
    if (structure.requiresProof) {
        constraints.push("Provide rigorous proof, not heuristics")
    }

    const invariants: string[] = []
    if (structure.hasSymmetry) {
        invariants.push("Symmetry preservation")
    }
    if (structure.type === "inequality") {
        invariants.push("Inequality direction")
    }

    const graph: { from: string; to: string; type: string }[] = []
    for (let i = 0; i < steps.length - 1; i++) {
        graph.push({ from: steps[i], to: steps[i + 1], type: "seq" })
    }

    return { steps, constraints, invariants, graph }
}
