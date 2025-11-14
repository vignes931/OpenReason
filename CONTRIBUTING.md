# Contributing to OpenReason

lowercase, functional, and chaotic — but organized chaos.

## Code of Conduct

- be respectful
- be constructive
- be lowercase (in docs and code style)
- no gatekeeping
- ship fast, iterate faster

## Getting Started

### Prerequisites

```bash
node >= 18
npm or bun
tsx (for TypeScript execution)
```

### Setup

```bash
# Clone
git clone https://github.com/nullure/Reasoner.git
cd Reasoner

# Install
npm install

# Configure
cp .env.example .env
# Add your API keys

# Test
npm test
```

## Project Structure

```
src/
├── core/              # Kernel, router, learning, types
├── constraint_core/   # Constitutional rules
├── affective_core/    # Context analysis
├── memory_unit/       # Episodic/semantic/procedural memory
├── api/              # LLM drivers
└── utils/            # Helpers

tests/                # Test suite
public/              # Configuration files
data/                # Runtime data (gitignored)
```

## Development Workflow

### 1. Pick an Issue

- Check [Issues](https://github.com/nullure/Reasoner/issues)
- Look for `good first issue` or `help wanted` labels
- Comment to claim it

### 2. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Code Style

**TypeScript**:

- lowercase variable names: `const my_var = ...`
- snake_case for functions: `function calculate_confidence() {}`
- PascalCase for classes: `class AdaptiveLearner {}`
- descriptive names, no abbreviations (except openreason, rdc, llm, etc.)

**Comments**:

- lowercase comments: `// calculate weighted average`
- no excessive commenting — code should be self-explanatory
- document complex algorithms only

**Imports**:

```typescript
// External first
import { readFileSync } from "fs";

// Internal second
import { load_cfg } from "./config";
import type { openreason_cfg } from "./types";
```

**Formatting**:

```bash
# We don't use Prettier (too opinionated)
# Just follow the existing style
# 4 spaces, no semicolons optional, trailing commas
```

### 4. Testing

**Required** for all contributions:

```bash
# Run all tests
npm test

# Run specific test
npx tsx tests/test_core.ts
npx tsx tests/test_learning.ts
npx tsx tests/test_memory.ts

# Add tests for new features
```

**Test Structure**:

```typescript
// Good test
const test_my_feature = () => {
  const result = my_feature("input");
  if (result === "expected") {
    console.log("✅ my_feature works");
  } else {
    console.log("❌ my_feature failed");
  }
};
```

### 5. Commit Messages

lowercase and descriptive:

```bash
git commit -m "add adaptive threshold learning"
git commit -m "fix memory leak in episodic storage"
git commit -m "update routing complexity calculation"
```

**Format**:

- `add`: new features
- `fix`: bug fixes
- `update`: improvements to existing features
- `remove`: deletions
- `refactor`: code restructuring

### 6. Pull Request

**Title**: lowercase, descriptive

```
add langgraph integration for graph-based reasoning
```

**Description**:

```markdown
## Changes

- implemented langgraph node wrapper
- added conditional retry logic
- updated tests

## Testing

- [x] all existing tests pass
- [x] added new tests for langgraph
- [x] manual testing completed

## Performance Impact

- negligible (only active when enabled)

## Breaking Changes

- none
```

## Contribution Areas

### High Priority

1. **Performance Optimization**

   - Reduce latency
   - Token optimization
   - Caching strategies

2. **Memory System**

   - Improve pattern extraction
   - Better schema evolution
   - Distributed storage

3. **Reasoning Modes**

   - Fine-tune complexity thresholds
   - Add new domains
   - Improve constraint rules

4. **Testing**
   - Increase coverage
   - Add integration tests
   - Performance benchmarks

### Good First Issues

- Documentation improvements
- Test additions
- Example applications
- Bug fixes
- Constraint rule refinements

### Advanced

- Parallel reasoning engine
- Streaming responses
- Self-hosted model support
- Distributed memory
- Graph-based reasoning

## Architecture Guidelines

### Adding New Features

**1. Routing/Modes**

```typescript
// Update router.ts
export class reasoning_depth_controller {
    route(query: string) {
        // Your logic
        return {
            mode: "reflex" | "analytic" | "reflective",
            domain: "math" | "logic" | ...,
            complexity: number
        }
    }
}
```

**2. Memory Systems**

```typescript
// Extend hierarchical_memory.ts
async store_episodic(entry: episodic_entry) {
    await this.episodic_db.set(`ep_${entry.timestamp}`, entry)
    await this.extract_patterns(await this.load_episodic())
}
```

**3. Constraints**

```typescript
// Add to public/constraints.json
{
    "domain": "your_domain",
    "rules": ["rule1", "rule2"],
    "mode_budgets": { ... }
}
```

### Code Review Checklist

- [ ] Follows lowercase style
- [ ] No TypeScript errors
- [ ] Tests included and passing
- [ ] No console.log for debugging (use logger)
- [ ] Error handling implemented
- [ ] Types properly defined
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Security reviewed

## Documentation

### Update When

- Adding new features
- Changing APIs
- Modifying architecture
- Adding configuration options

### Files to Update

- `README.md` - Usage and features
- `architecture.md` - System design
- `SECURITY.md` - Security considerations
- Inline code documentation

## Performance Guidelines

### Optimization Priorities

1. **Latency** - LLM calls dominate
2. **Memory** - Keep episodic storage bounded
3. **Token Usage** - Optimize prompts
4. **Caching** - Use provider caching

### Benchmarking

```typescript
import { timer } from "./utils/timer";

const t = new timer();
// your code
console.log(`elapsed: ${t.elapsed()}ms`);
```

## Testing Guidelines

### Test Categories

1. **Unit Tests**: Individual functions
2. **Integration Tests**: Component interactions
3. **End-to-End Tests**: Full reasoning pipeline

### Coverage Goals

- Core systems: 90%+
- Memory systems: 80%+
- Utilities: 70%+
- API drivers: Basic smoke tests

### Test Data

- Use deterministic examples
- Cover edge cases
- Test error conditions
- Verify performance

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Tag release: `git tag v0.2.1`
4. Push: `git push --tags`
5. GitHub release with notes

## Questions?

- Open an [issue](https://github.com/nullure/Reasoner/issues)
- Discussion on [GitHub Discussions]
- Check existing documentation

## Recognition

Contributors added to:

- README.md contributors section
- Release notes
- Git history (obviously)

## License

By contributing, you agree your contributions will be licensed under MIT.

---

**happy coding. keep it lowercase. keep it functional.**
