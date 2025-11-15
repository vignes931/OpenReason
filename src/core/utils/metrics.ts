export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

export function adaptive_confidence(A: number, S: number, L: number, alpha = 0.6, beta = 0.4, gamma = 0.001) {
    return sigmoid(alpha * A + beta * S - gamma * L)
}

export function prompt_mutation_probability(A: number, k = 3) {
    return 1 - Math.exp(-k * (1 - A))
}

export function unified_quality(A: number, C: number, T: number, L: number, weights = { alpha: 0.4, beta: 0.3, gamma: 0.2, delta: 0.1 }) {
    const { alpha, beta, gamma, delta } = weights
    return alpha * A + beta * C + gamma * (1 - T) + delta * (1 - L)
}
