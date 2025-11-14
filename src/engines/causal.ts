export function analyzeCausal(query: string): string | null {
    if (/if .* then .*/i.test(query)) return "Consider cause-effect paths and counterfactuals."
    return null
}
