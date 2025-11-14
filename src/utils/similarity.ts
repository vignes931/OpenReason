export const similarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0

    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const mag_a = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const mag_b = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

    return mag_a && mag_b ? dot / (mag_a * mag_b) : 0
}
