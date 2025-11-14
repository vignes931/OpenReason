export function normalize(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
}
