export function reasonEthics(query: string): string | null {
    if (/should|moral|ethical/i.test(query)) return "Compare utilitarian, deontological, and virtue ethics perspectives."
    return null
}
