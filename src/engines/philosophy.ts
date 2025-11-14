export function reflectPhilosophy(query: string): string | null {
    if (/truth|identity|existence/i.test(query)) return "Frame the question within major philosophical views and analyze."
    return null
}
