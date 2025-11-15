export type UnificationResult = {
    unified: string
    coherence: number
    removedContradictions: number
}

const cosine_sim = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0)
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return magA && magB ? dot / (magA * magB) : 0
}

const simple_vectorize = (text: string): number[] => {
    const words = text.toLowerCase().split(/\W+/).filter(Boolean)
    const vocab = Array.from(new Set(words))
    return vocab.map(word => words.filter(w => w === word).length / words.length)
}

const remove_contradictory_statements = (steps: string[]): { cleaned: string[]; removed: number } => {
    const cleaned: string[] = []
    let removed = 0

    for (let i = 0; i < steps.length; i++) {
        const current = steps[i].toLowerCase()
        let isContradictory = false

        for (let j = i + 1; j < steps.length; j++) {
            const next = steps[j].toLowerCase()
            if (
                (current.includes("not") && next.includes(current.replace("not", "").trim())) ||
                (next.includes("not") && current.includes(next.replace("not", "").trim()))
            ) {
                isContradictory = true
                removed++
                break
            }
        }

        if (!isContradictory) {
            cleaned.push(steps[i])
        }
    }

    return { cleaned, removed }
}

export const unify_steps = (steps: string[]): UnificationResult => {
    const { cleaned, removed } = remove_contradictory_statements(steps)

    const vectors = cleaned.map(step => simple_vectorize(step))
    let totalCoherence = 0
    let comparisons = 0

    for (let i = 0; i < vectors.length - 1; i++) {
        totalCoherence += cosine_sim(vectors[i], vectors[i + 1])
        comparisons++
    }

    const coherence = comparisons > 0 ? totalCoherence / comparisons : 1

    const unified = cleaned.join("\n\n")

    return {
        unified,
        coherence,
        removedContradictions: removed
    }
}
