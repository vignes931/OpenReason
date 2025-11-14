import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export async function callGoogle(prompt: string, apiKey: string, model: string): Promise<string> {
    const client = new ChatGoogleGenerativeAI({ model, apiKey })
    const res = await (client as any).invoke(prompt)
    return typeof res.content === "string" ? res.content : Array.isArray(res.content) ? res.content.map((c: any) => (typeof c === "string" ? c : c.text || "")).join("") : JSON.stringify(res.content)
}
