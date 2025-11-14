import openreason from "../../dist/index.mjs"

console.log("🧪 Testing NPM Package Distribution\n")

async function testNpmPackage() {
    console.log("1️⃣ Testing CommonJS require...")
    try {
        const cjs = require("../../dist/index.cjs")
        console.log("✓ CommonJS import successful")
        console.log(`   Exports: ${Object.keys(cjs).slice(0, 5).join(", ")}...`)
    } catch (err: any) {
        console.error("✗ CommonJS import failed:", err.message)
    }

    console.log("\n2️⃣ Testing ESM import...")
    try {
        console.log("✓ ESM import successful")
        console.log(`   Exports: ${Object.keys(openreason).slice(0, 5).join(", ")}...`)
    } catch (err: any) {
        console.error("✗ ESM import failed:", err.message)
    }

    console.log("\n3️⃣ Testing TypeScript definitions...")
    const fs = await import("fs")
    const defsPath = "./dist/index.d.ts"

    if (fs.existsSync(defsPath)) {
        console.log("✓ TypeScript definitions found")
        const content = fs.readFileSync(defsPath, "utf8")
        const exportCount = (content.match(/export/g) || []).length
        console.log(`   Exports defined: ${exportCount}`)
    } else {
        console.error("✗ TypeScript definitions not found")
    }

    console.log("\n4️⃣ Testing exported functions...")
    const requiredExports = [
        "init",
        "reason",
        "kernel",
        "adaptive_reasoning_throttle",
        "precisionCore",
        "semantic_evaluator",
        "reasoning_compressor",
        "mode_compliance_enforcer"
    ]

    let missingExports = []
    for (const exportName of requiredExports) {
        if (openreason[exportName]) {
            console.log(`✓ ${exportName} exported`)
        } else {
            console.log(`✗ ${exportName} missing`)
            missingExports.push(exportName)
        }
    }

    console.log("\n5️⃣ Testing functional API...")
    try {
        if (typeof openreason.init === "function") {
            console.log("✓ init() is callable")
        }
        if (typeof openreason.reason === "function") {
            console.log("✓ reason() is callable")
        }
    } catch (err: any) {
        console.error("✗ API test failed:", err.message)
    }

    console.log("\n6️⃣ Testing package.json integrity...")
    const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"))

    const checks = [
        { name: "name", value: pkg.name, expected: "openreason" },
        { name: "version", value: pkg.version, valid: /^\d+\.\d+\.\d+$/.test(pkg.version) },
        { name: "main", value: pkg.main, expected: "dist/index.cjs" },
        { name: "module", value: pkg.module, expected: "dist/index.mjs" },
        { name: "types", value: pkg.types, expected: "dist/index.d.ts" }
    ]

    for (const check of checks) {
        if (check.expected) {
            if (check.value === check.expected) {
                console.log(`✓ ${check.name}: ${check.value}`)
            } else {
                console.log(`✗ ${check.name}: expected ${check.expected}, got ${check.value}`)
            }
        } else if (check.valid) {
            console.log(`✓ ${check.name}: ${check.value}`)
        } else {
            console.log(`✗ ${check.name}: invalid format`)
        }
    }

    console.log("\n7️⃣ Testing dist/ structure...")
    const requiredFiles = [
        "dist/index.cjs",
        "dist/index.mjs",
        "dist/index.d.ts"
    ]

    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file)
            console.log(`✓ ${file} (${(stats.size / 1024).toFixed(1)} KB)`)
        } else {
            console.log(`✗ ${file} missing`)
        }
    }

    console.log("\n8️⃣ Testing precision core exports...")
    const precisionExports = [
        "precisionCore",
        "precision_core",
        "reasoning_compressor",
        "semantic_evaluator",
        "path_pruner",
        "mode_compliance_enforcer",
        "MODE_CONSTRAINTS"
    ]

    for (const exp of precisionExports) {
        if (openreason[exp]) {
            console.log(`✓ ${exp} available`)
        } else {
            console.log(`⚠️  ${exp} not exported (may be internal)`)
        }
    }

    return missingExports.length === 0
}

console.log("=".repeat(60))
testNpmPackage().then(success => {
    console.log("\n" + "=".repeat(60))
    if (success) {
        console.log("✅ NPM Package Tests Passed")
        console.log("\nPackage is ready for publishing!")
        console.log("Run: npm publish")
        process.exit(0)
    } else {
        console.log("⚠️  Some exports missing - check build")
        process.exit(1)
    }
}).catch(err => {
    console.error("\n❌ NPM Package test failed:", err)
    process.exit(1)
})
