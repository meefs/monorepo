# Unified Formatting & Linting Package for Outfitter

## Executive Summary

This document proposes evolving the existing `@outfitter/flint` package into a comprehensive code quality orchestration tool that unifies Biome/Ultracite, Prettier, Stylelint, and Markdownlint under a single, configurable interface. This would reduce complexity, improve performance, and provide consistent code quality standards across all Outfitter projects.

## Current State Analysis

### Template Configuration (bun-monorepo)

The bun-monorepo template currently uses **six separate tools** for code quality:

1. **Biome** (via Ultracite) - TypeScript/JavaScript linting and formatting
2. **Prettier** - JSON, YAML formatting
3. **Stylelint** - CSS linting and formatting
4. **Markdownlint-cli2** - Markdown linting and formatting
5. **Commitlint** - Commit message validation
6. **Lefthook** - Git hooks orchestration

### Configuration Overhead

Each tool requires its own configuration file:

- `biome.jsonc` (43 lines)
- `.prettierrc.json` (19 lines)
- `.stylelintrc.json` (28 lines)
- `.markdownlint-cli2.jsonc` (43 lines)
- `commitlint.config.js`
- `lefthook.yml`

**Total**: 6 config files, ~160+ lines of configuration

### Script Complexity

The package.json contains 11 different formatting/linting scripts:

```json
"format"
"format:check"
"format:check:all"
"lint"
"lint:fix"
"lint:md"
"lint:md:fix"
"lint:css"
"lint:css:fix"
"lint:packages"
"ci:full"
```

## Proposed Solution: Unified Code Quality Package

### Package Evolution: @outfitter/flint v2

Transform the existing `@outfitter/flint` from a configuration generator to a full orchestration layer.

### Core Architecture

```typescript
// Single configuration file: outfitter.config.js
export default {
  // Single opinionated preset based on bun-monorepo standards
  // No preset options - one consistent standard across all projects

  // Feature toggles (all enabled by default)
  features: {
    typescript: true, // Biome/Ultracite
    markdown: true, // Markdownlint
    styles: true, // Stylelint
    json: true, // Prettier
    commits: true, // Commitlint via Lefthook
    packages: false, // Publint (opt-in for libraries)
  },

  // Tool-specific overrides only when needed
  overrides: {
    biome: {
      /* specific biome rules if needed */
    },
    prettier: {
      /* specific prettier rules if needed */
    },
    stylelint: {
      /* specific stylelint rules if needed */
    },
    markdown: {
      /* specific markdown rules if needed */
    },
  },
};
```

The base configuration would be built-in and match the bun-monorepo template exactly:

- Indent: 2 spaces
- Line endings: LF
- Max line length: 100
- Quotes: Single
- Trailing comma: Yes
- Semicolons: Yes

### Unified CLI Interface

```bash
# Single command replaces all formatting scripts
outfitter format              # Format all files
outfitter lint                # Lint without fixing
outfitter check              # Check all (format + lint + types)

# Targeted commands
outfitter format --only ts   # Format only TypeScript
outfitter lint --only md     # Lint only Markdown
outfitter check --fix        # Fix all issues

# Development workflow
outfitter watch              # Watch mode
outfitter pre-commit        # Git hook integration (via lefthook)
outfitter ci                # CI/CD mode with reporting
```

### Implementation Strategy

#### Phase 1: Foundation (Wrapper Mode)

- Create CLI that wraps existing tools
- Parse unified config and generate tool-specific configs
- Provide single entry point for all operations
- Maintain backward compatibility

#### Phase 2: Optimization

- Parallelize tool execution using Bun's performance
- Implement smart caching for unchanged files
- Add incremental checking for large codebases
- Integrate with Turborepo for monorepo awareness

#### Phase 3: Intelligence

- Detect file types automatically
- Suggest configuration based on project analysis
- Provide unified error reporting with context
- Add AI-assisted rule recommendations

## Technical Design

### Package Structure

```text
@outfitter/flint/
├── src/
│   ├── cli/              # CLI entry points
│   ├── config/           # Configuration loaders
│   ├── orchestrator/     # Tool orchestration
│   ├── tools/            # Tool-specific adapters
│   │   ├── biome.ts
│   │   ├── prettier.ts
│   │   ├── stylelint.ts
│   │   └── markdown.ts
│   ├── presets/          # Configuration presets
│   └── utils/            # Shared utilities
├── templates/            # Config templates
└── bin/
    └── outfitter.js      # CLI executable
```

### Tool Precedence & Conflict Resolution

```typescript
const FILE_HANDLERS = {
  '.ts': ['biome'],
  '.tsx': ['biome'],
  '.js': ['biome'],
  '.jsx': ['biome'],
  '.json': ['prettier'], // Prettier wins for JSON
  '.yaml': ['prettier'], // Prettier wins for YAML
  '.yml': ['prettier'],
  '.css': ['stylelint'], // Stylelint for CSS
  '.scss': ['stylelint'],
  '.md': ['markdownlint'], // Markdownlint for Markdown
  '.mdx': ['markdownlint'],
};
```

### Performance Optimizations

1. **Parallel Execution**: Run non-conflicting tools simultaneously
2. **File Batching**: Group files by tool to minimize process spawning
3. **Incremental Mode**: Only check changed files (git diff awareness)
4. **Cache Layer**: Store results for unchanged files
5. **Bun Native**: Leverage Bun's speed for orchestration

## Migration Path

### For Existing Projects

```bash
# Analyze current configuration
outfitter migrate analyze

# Generate unified config from existing
outfitter migrate generate

# Test unified approach alongside existing
outfitter check --compare

# Remove old configs when ready
outfitter migrate cleanup
```

### Incremental Adoption

1. **Stage 1**: Use alongside existing tools
2. **Stage 2**: Replace scripts but keep configs
3. **Stage 3**: Migrate to unified config
4. **Stage 4**: Remove individual tool configs

## Benefits & Impact

### Quantifiable Improvements

| Metric         | Current  | Proposed    | Improvement   |
| -------------- | -------- | ----------- | ------------- |
| Config files   | 6        | 1           | 83% reduction |
| Config lines   | ~160     | ~20         | 88% reduction |
| NPM scripts    | 11       | 3           | 73% reduction |
| Dependencies   | 6+ tools | 1 package   | 83% reduction |
| Learning curve | 6 tools  | 1 interface | 83% reduction |

### Developer Experience

- **Single source of truth** for code quality settings
- **Consistent commands** across all projects
- **Faster execution** through parallelization
- **Better error messages** with unified context
- **Simpler CI/CD** configuration

### Organizational Benefits

- **Standardization**: Enforce organization-wide code quality
- **Onboarding**: New developers learn one tool
- **Maintenance**: Single package to update
- **Flexibility**: Easy to adjust standards globally
- **Compliance**: Centralized quality reporting

## Configuration Examples

### Default Setup (Most Projects)

```javascript
// Uses all standard tools from bun-monorepo template
export default {}; // That's it! All defaults applied
```

### Library Package

```javascript
// Enable package linting for npm libraries
export default {
  features: {
    packages: true, // Add publint for npm package validation
  },
};
```

### Project Without CSS

```javascript
// Disable specific tools if not needed
export default {
  features: {
    styles: false, // No CSS files in this project
  },
};
```

### Custom Rule Override

```javascript
// Override specific rules when needed
export default {
  overrides: {
    biome: {
      complexity: {
        maxComplexity: 15, // Allow higher complexity for specific project
      },
    },
  },
};
```

## Rollout Strategy

### Timeline

**Q1 2025**:

- Prototype CLI wrapper
- Test with select projects
- Gather feedback

**Q2 2025**:

- Production release
- Migration tooling
- Documentation

**Q3 2025**:

- Performance optimizations
- Advanced features
- Full adoption

### Success Metrics

- **Adoption rate**: 80% of Outfitter projects within 6 months
- **Build time**: 30% faster formatting/linting in CI
- **Developer satisfaction**: Reduced complexity feedback
- **Maintenance burden**: 50% fewer config-related issues

## Technical Considerations

### Dependencies

Keep minimal runtime dependencies:

- **Required**: Tool binaries (biome, prettier, etc.)
- **Optional**: Performance enhancers (cache libraries)
- **Development**: Testing and build tools only

### Compatibility

- **Node.js**: 18+ (for native Bun support)
- **Platforms**: macOS, Linux, Windows (via WSL)
- **CI/CD**: GitHub Actions, Vercel, Cloudflare
- **Editors**: VSCode, Cursor, Zed (via extensions)

### Escape Hatches

Always provide ways to:

- Eject to individual tool configs
- Override any setting
- Disable specific tools
- Run tools directly if needed

## Git Hooks Integration

### Lefthook Configuration

The package would automatically configure Lefthook for git hooks:

```yaml
# Generated lefthook.yml
pre-commit:
  commands:
    format:
      run: outfitter format --staged
    lint:
      run: outfitter lint --staged

commit-msg:
  commands:
    commitlint:
      run: outfitter commitlint --edit {1}

pre-push:
  commands:
    typecheck:
      run: outfitter typecheck
    test:
      run: bun test
```

This would be managed entirely by the `outfitter` CLI:

- `outfitter init` sets up Lefthook automatically
- `outfitter hooks install` reinstalls hooks if needed
- `outfitter hooks uninstall` removes hooks for CI environments

## Conclusion

By consolidating six separate formatting and linting tools into a single, intelligent orchestration layer with one opinionated preset, we can dramatically simplify the developer experience while maintaining the power and flexibility of best-in-class tools. The evolution of `@outfitter/flint` from a config generator to a comprehensive code quality platform represents a natural progression that aligns with Outfitter's goals of reducing complexity and improving developer velocity.

The proposed solution leverages Bun's performance advantages, maintains backward compatibility, and provides a clear migration path for existing projects. With an 83% reduction in configuration overhead and a unified interface for all code quality operations, this package would become a cornerstone of the Outfitter development experience.

**Key principle**: One opinionated standard based on the proven bun-monorepo template, not multiple presets. This ensures consistency across all Outfitter projects while still allowing targeted overrides when genuinely needed.

## Next Steps

1. **Validate approach** with key stakeholders
2. **Create proof of concept** with basic CLI wrapper
3. **Test with real projects** from the monorepo
4. **Refine based on feedback**
5. **Plan production rollout**

## Appendix: Current Tool Analysis

### Ultracite (Biome Wrapper)

- **Purpose**: Opinionated Biome configuration
- **Strength**: Zero-config for TypeScript/JavaScript
- **Integration**: Extends base Biome rules

### Prettier

- **Purpose**: JSON, YAML formatting
- **Strength**: Widely adopted, consistent
- **Overlap**: Could handle JS/TS but Biome is faster

### Stylelint

- **Purpose**: CSS/SCSS linting
- **Strength**: Tailwind-aware rules
- **Unique**: No overlap with other tools

### Markdownlint-cli2

- **Purpose**: Markdown formatting and linting
- **Strength**: Extensive rule set
- **Configuration**: Complex but powerful

### Tool Execution Flow

Current parallel execution opportunity:

```text
Biome (TS/JS) ─┐
Prettier (JSON)─┼─→ Unified Result
Stylelint (CSS)─┤
Markdown (MD) ──┘
```

This parallel execution model would be built into the orchestrator, providing significant performance improvements over sequential execution.
