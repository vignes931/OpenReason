import { openreason_config } from "../config/init"
import { domain, mode } from "../config/router"
import { invoke_provider } from "../../api/provider"
import { solveMath } from "../../engines/math"
import { assessLogic } from "../../engines/logic"
import { reasonEthics } from "../../engines/ethics"
import { analyzeCausal } from "../../engines/causal"

export const depth_to_mode = (depth: number): mode => {
    if (depth <= 1) return "reflex"
    if (depth === 2) return "analytic"
    return "reflective"
}

export const quick_respond = async (query: string, cfg: openreason_config, detectedDomain: domain): Promise<string> => {
    let det: string | null = null
    if (detectedDomain === "math") det = solveMath(query)
    else if (detectedDomain === "logic") det = assessLogic(query)
    else if (detectedDomain === "ethics") det = reasonEthics(query)
    else if (detectedDomain === "causal") det = analyzeCausal(query)

    if (det) {
        return det
    }

    const prompt = `Answer the following question in one or two sentences with no intermediate reasoning unless absolutely necessary:\n${query}`
    return invoke_provider(
        prompt,
        cfg.provider,
        cfg.apiKey,
        cfg.simpleModel ?? cfg.model,
        cfg.performance?.timeout || 20000
    )
}
