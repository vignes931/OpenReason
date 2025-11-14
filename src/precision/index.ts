export const precisionCore = {
    async evaluate(output: string, expected: string) {
        if (!expected) return { score: 0, accuracy: "unknown" as const, similarity: 0 }
        const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
        const match = norm(output).includes(norm(expected))
        return { score: match ? 1 : 0, accuracy: match ? "pass" as const : "fail" as const, similarity: match ? 1 : 0 }
    },
    async evaluatePoints(output: string, points: string[]) {
        const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
        const out = norm(output)
        const matchedPoints = points.filter(p => out.includes(norm(p)))
        const missedPoints = points.filter(p => !out.includes(norm(p)))
        const overallScore = points.length ? matchedPoints.length / points.length : 0
        return { matchedPoints, missedPoints, overallScore }
    }
}
