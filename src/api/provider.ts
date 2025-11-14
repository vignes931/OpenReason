import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { log_error } from "../core/logger"

export const invoke_provider = async (
    prompt: string,
    provider: string,
    apiKey: string,
    model: string,
    timeout: number = 30000
): Promise<string> => {
    try {
        let client: any

        switch (provider) {
            case "openai":
                client = new ChatOpenAI({
                    modelName: model,
                    openAIApiKey: apiKey,
                    timeout
                })
                break

            case "anthropic":
                client = new ChatAnthropic({
                    modelName: model,
                    anthropicApiKey: apiKey,
                    timeout
                })
                break

            case "google":
                client = new ChatGoogleGenerativeAI({
                    model,
                    apiKey
                })
                break

            case "xai":
                client = new ChatOpenAI({
                    modelName: model,
                    openAIApiKey: apiKey,
                    configuration: {
                        baseURL: "https://api.x.ai/v1"
                    },
                    timeout
                })
                break

            case "mock":
                // Lightweight mock provider for tests/offline runs
                return mock_response(prompt)

            default:
                throw new Error(`Unknown provider: ${provider}`)
        }

        const response = await client.invoke(prompt)
        const content = typeof response.content === "string"
            ? response.content
            : Array.isArray(response.content)
                ? response.content.map((c: any) => typeof c === "string" ? c : c.text || "").join("")
                : JSON.stringify(response.content)

        return content
    } catch (error: any) {
        log_error(`Provider ${provider} failed`, error)
        throw error
    }
}

const mock_response = (prompt: string): string => {
    const q = prompt.toLowerCase()
    if (q.includes("2 + 2") || q.includes("2+2")) return "4"
    if (q.includes("capital of france")) return "Paris"
    if (q.includes("socrates") && q.includes("mortal")) return "Yes, Socrates is mortal."
    if (q.includes("should") && (q.includes("ai") || q.includes("robot"))) return "It depends on ethical frameworks; generally, we should prioritize human welfare."
    return "Here is a concise answer based on the prompt."
}
