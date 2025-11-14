#!/usr/bin/env node
import openreason from "../index"
import * as dotenv from "dotenv"

dotenv.config()

const main = async () => {
    const query = process.argv.slice(2).join(" ")

    if (!query) {
        console.log("Usage: npx openreason <query>")
        process.exit(1)
    }

    const provider = (process.env.PROVIDER || "openai") as "openai" | "anthropic" | "google" | "xai"
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || process.env.XAI_API_KEY || ""
    const model = process.env.OPENREASON_MODEL || "gpt-4o"
    const simpleModel = process.env.OPENREASON_SIMPLE_MODEL || "gpt-4o-mini"

    if (!apiKey) {
        console.error("Error: API key not found in environment variables")
        console.error("Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, or XAI_API_KEY")
        process.exit(1)
    }

    openreason.init({
        provider,
        apiKey,
        model,
        simpleModel,
        memory: { enabled: true, path: "./data/memory.db" }
    })

    console.log(`Query: ${query}\n`)

    const result = await openreason.reason(query)

    console.log(`Verdict: ${result.verdict}`)
    console.log(`Confidence: ${result.confidence.toFixed(2)}`)
    console.log(`Mode: ${result.mode}`)
    console.log(`Domain: ${result.domain}`)
    console.log(`Latency: ${result.latency}ms`)

    if (result.evolutionStep) {
        console.log(`Evolution Step: ${result.evolutionStep}`)
    }
}

main().catch(console.error)
