import { mode, domain } from "./router"

export const reflex_prompt = `Answer precisely with no reasoning unless ambiguity exists. Be direct and concise.`

export const analytic_prompt = `Reason step-by-step. Label each step as [Step 1], [Step 2], etc. Show your logical progression.`

export const reflective_prompt = `Analyze implications, ethics, and causal outcomes. Use logic trees. Consider multiple perspectives before concluding.`

export const build_prompt = (query: string, reasoning_mode: mode, reasoning_domain: domain, context?: string): string => {
    let system_prompt = ""

    switch (reasoning_mode) {
        case "reflex":
            system_prompt = reflex_prompt
            break
        case "analytic":
            system_prompt = analytic_prompt
            break
        case "reflective":
            system_prompt = reflective_prompt
            break
    }

    const domain_context = domain_enhancements[reasoning_domain] || ""

    const full_prompt = `${system_prompt}

Domain: ${reasoning_domain}
${domain_context}

${context ? `Context: ${context}\n\n` : ""}Query: ${query}`

    return full_prompt
}

const domain_enhancements: Record<domain, string> = {
    math: "Use symbolic notation. Show algebraic steps. Verify results.",
    logic: "Identify premises. Apply inference rules. Check validity.",
    causal: "Map cause-effect chains. Check temporal ordering. Consider counterfactuals.",
    philosophy: "Define terms. Consider multiple frameworks. Address paradoxes.",
    ethics: "Apply utilitarian, deontological, and virtue ethics frameworks. Balance competing values.",
    general: ""
}
