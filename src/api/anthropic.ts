import { ChatAnthropic } from "@langchain/anthropic"

export async function callAnthropic(prompt: string, apiKey: string, model: string, timeout = 30000): Promise<string> {
    const client = new ChatAnthropic({ modelName: model, anthropicApiKey: apiKey, timeout })
    const res = await (client as any).invoke(prompt)
    return typeof res.content === "string" ? res.content : Array.isArray(res.content) ? res.content.map((c: any) => (typeof c === "string" ? c : c.text || "")).join("") : JSON.stringify(res.content)
}
