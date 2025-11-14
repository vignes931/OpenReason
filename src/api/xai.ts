import { ChatOpenAI } from "@langchain/openai"

export async function callXAI(prompt: string, apiKey: string, model: string, timeout = 30000): Promise<string> {
    const client = new ChatOpenAI({ modelName: model, openAIApiKey: apiKey, configuration: { baseURL: "https://api.x.ai/v1" }, timeout })
    const res = await client.invoke(prompt)
    return typeof res.content === "string" ? res.content : Array.isArray(res.content) ? res.content.map((c: any) => (typeof c === "string" ? c : c.text || "")).join("") : JSON.stringify(res.content)
}
