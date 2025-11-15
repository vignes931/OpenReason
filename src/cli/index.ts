#!/usr/bin/env node
import { existsSync, readFileSync } from "fs"
import path from "path"
import openreason from "../index"

type provider_name = "openai" | "anthropic" | "google" | "xai" | "mock"

type cli_options = {
    help?: boolean
    envFile?: string
    provider?: provider_name
    apiKey?: string
    model?: string
    simpleModel?: string
    complexModel?: string
    memory?: boolean
    memoryPath?: string
}

const HELP_TEXT = `Usage: npx openreason [options] <query>

Options:
  --provider <name>        Override provider (openai|anthropic|google|xai|mock)
  --api-key <key>          Explicit API key (overrides env)
  --model <name>           Main reasoning model
  --simple-model <name>    Reflex model override
  --complex-model <name>   Reflective model override
  --memory <bool>          Enable/disable memory (default true)
  --memory-path <path>     Path for Keyv SQLite store
  --env <file>             Load variables from a .env-style file
  --help                   Show this message
`

const parse_boolean = (value?: string) => {
    if (!value) return true
    return !["false", "0", "no", "off"].includes(value.toLowerCase())
}

const parse_args = (argv: string[]): { options: cli_options; query: string } => {
    const options: cli_options = {}
    const queryParts: string[] = []
    let i = 0
    while (i < argv.length) {
        const token = argv[i]
        if (!token.startsWith("-")) {
            queryParts.push(...argv.slice(i))
            break
        }

        const next = () => argv[++i]
        switch (token) {
            case "--help":
            case "-h":
                options.help = true
                i += 1
                break
            case "--env":
                options.envFile = next()
                i += 1
                break
            case "--provider":
                options.provider = next() as provider_name
                i += 1
                break
            case "--api-key":
                options.apiKey = next()
                i += 1
                break
            case "--model":
                options.model = next()
                i += 1
                break
            case "--simple-model":
                options.simpleModel = next()
                i += 1
                break
            case "--complex-model":
                options.complexModel = next()
                i += 1
                break
            case "--memory":
                options.memory = parse_boolean(next())
                i += 1
                break
            case "--memory-path":
                options.memoryPath = next()
                i += 1
                break
            default:
                console.error(`Unknown option: ${token}`)
                console.log(HELP_TEXT)
                process.exit(1)
        }
    }

    return { options, query: queryParts.join(" ").trim() }
}

const load_env_file = (filePath: string) => {
    if (!existsSync(filePath)) {
        console.warn(`Warning: env file not found at ${filePath}`)
        return
    }
    const content = readFileSync(filePath, "utf-8")
    content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) return
        const eq = trimmed.indexOf("=")
        if (eq === -1) return
        const key = trimmed.slice(0, eq).trim()
        const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "")
        if (!process.env[key]) {
            process.env[key] = value
        }
    })
}

const bootstrap_env = (requestedFile?: string) => {
    if (requestedFile) {
        load_env_file(path.resolve(process.cwd(), requestedFile))
        return
    }
    const defaultPath = path.resolve(process.cwd(), ".env")
    if (existsSync(defaultPath)) {
        load_env_file(defaultPath)
    }
}

const main = async () => {
    const argv = process.argv.slice(2)
    const { options, query } = parse_args(argv)

    if (options.help) {
        console.log(HELP_TEXT)
        process.exit(0)
    }

    bootstrap_env(options.envFile)

    if (!query) {
        console.log(HELP_TEXT)
        process.exit(1)
    }

    const provider = (options.provider || process.env.PROVIDER || "openai") as provider_name
    const apiKey = options.apiKey
        || process.env.OPENAI_API_KEY
        || process.env.ANTHROPIC_API_KEY
        || process.env.GOOGLE_API_KEY
        || process.env.XAI_API_KEY
        || ""

    const model = options.model || process.env.OPENREASON_MODEL || "gpt-4o"
    const simpleModel = options.simpleModel || process.env.OPENREASON_SIMPLE_MODEL || "gpt-4o-mini"
    const complexModel = options.complexModel || process.env.OPENREASON_COMPLEX_MODEL
    const memoryEnabled = options.memory ?? true
    const memoryPath = options.memoryPath || process.env.OPENREASON_MEMORY_PATH || "./data/memory.db"

    if (!apiKey && provider !== "mock") {
        console.error("Error: API key not found. Set an env var or pass --api-key.")
        process.exit(1)
    }

    openreason.init({
        provider: provider === "mock" ? "mock" : (provider as provider_name),
        apiKey,
        model,
        simpleModel,
        complexModel,
        memory: { enabled: memoryEnabled, path: memoryPath }
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

main().catch(err => {
    console.error(err)
    process.exit(1)
})
