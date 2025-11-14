export const vectorize = (text: string): number[] => {
    const tokens = text.toLowerCase().split(/\s+/)
    const vec = new Array(128).fill(0)

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        for (let j = 0; j < token.length; j++) {
            const code = token.charCodeAt(j) % 128
            vec[code] += 1
        }
    }

    const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0))
    return mag > 0 ? vec.map(v => v / mag) : vec
}
