import { ChatOpenAI } from "@langchain/openai"

export async function callOpenAI(prompt: string, apiKey: string, model: string, timeout = 30000): Promise<string> {
    const client = new ChatOpenAI({ modelName: model, openAIApiKey: apiKey, timeout })
    const res = await client.invoke(prompt)
    return typeof res.content === "string" ? res.content : Array.isArray(res.content) ? res.content.map((c: any) => (typeof c === "string" ? c : c.text || "")).join("") : JSON.stringify(res.content)
}
