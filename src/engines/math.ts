export function solveMath(query: string): string | null {
    const add = query.match(/(\d+)\s*\+\s*(\d+)/)
    if (add) return String(parseInt(add[1], 10) + parseInt(add[2], 10))
    const mul = query.match(/(\d+)\s*\*\s*(\d+)/)
    if (mul) return String(parseInt(mul[1], 10) * parseInt(mul[2], 10))
    return null
}
