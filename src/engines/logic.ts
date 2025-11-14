export function assessLogic(query: string): string | null {
    if (/socrates.*mortal/i.test(query)) return "Yes, Socrates is mortal."
    return null
}
