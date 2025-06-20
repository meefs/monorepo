# markdown-medic

> Opinionated markdown linting and formatting powered by markdownlint-cli2

## Overview

Markdown Medic is a thin wrapper around the excellent `markdownlint-cli2` that provides:

- 🎯 **Opinionated presets** - Strict, standard, and relaxed configurations
- 📝 **Smart defaults** - Sensible rules for technical documentation
- 🔧 **Custom rules** - Extended functionality like terminology enforcement
- ⚡ **Zero config** - Works out of the box with built-in presets
- 🏥 **Auto-healing** - Fix issues automatically with `--fix`

## Installation

```bash
# Install globally
npm install -g markdown-medic

# Or as a dev dependency
npm install -D markdown-medic
```

## Usage

### CLI

Both `mdmedic` and `markdown-medic` commands are available:

```bash
# Check all markdown files (uses standard preset by default)
mdmedic                # Short alias
markdown-medic         # Full command

# Fix auto-fixable issues
mdmedic --fix

# Check specific files or patterns
mdmedic "docs/**/*.md" README.md

# Use a specific preset
mdmedic --preset strict
mdmedic --preset relaxed

# Create a config file
mdmedic --init
mdmedic --init strict  # Initialize with strict preset

# Use custom config
mdmedic --config .mdmedic.config.yaml
```

### Configuration

When you run `mdmedic --init`, it creates a `.mdmedic.config.yaml` file:

```yaml
# Markdown Medic - Standard Preset
# Balanced rules for technical documentation

# Extend base markdownlint rules
extends: null

# Default state for all rules
default: true

# Rule overrides
MD003:
  style: atx
MD004:
  style: dash
# ... more rules ...

# Terminology enforcement
terminology:
  - { incorrect: 'NPM', correct: 'npm' }
  - { incorrect: 'Javascript', correct: 'JavaScript' }
  - { incorrect: 'Typescript', correct: 'TypeScript' }
  # ... more terms ...

# Custom rules
customRules:
  - ./node_modules/markdown-medic/dist/rules/consistent-terminology.js

# Ignore patterns
ignores:
  - node_modules/**
  - CHANGELOG.md
```

## Presets

### Strict

- Line length: 80 characters
- All markdownlint rules enabled
- No inline HTML
- Strict heading hierarchy
- Enforces consistent formatting

### Standard (default)

- Line length: Ignored (use Prettier)
- Balanced ruleset for technical docs
- Inline HTML allowed
- Flexible but consistent

### Relaxed

- Minimal rules enabled
- Focus on basic consistency
- Very permissive
- Good for legacy codebases

## Features

### Built on markdownlint-cli2

This package leverages all the features of `markdownlint-cli2`:

- ⚡ Fast parallel processing
- 📁 Glob pattern support
- 🔍 Configuration file discovery
- 💾 Caching for performance
- 🎯 Targeted fixes
- 📊 Multiple output formats
- 🔌 Plugin support

### Custom Rules

#### Consistent Terminology

Automatically fixes common terminology issues:

- `NPM` → `npm`
- `Javascript` → `JavaScript`
- `VSCode` → `VS Code`
- And many more...

## Integration

### package.json Scripts

```json
{
  "scripts": {
    "lint:md": "mdmedic",
    "lint:md:fix": "mdmedic --fix"
  }
}
```

### VS Code

The config files work seamlessly with the [markdownlint VS Code extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint).

### GitHub Actions

```yaml
- name: Lint Markdown
  run: |
    npm install -g markdown-medic
    mdmedic
```

### Pre-commit Hook

```yaml
repos:
  - repo: local
    hooks:
      - id: mdmedic
        name: Lint Markdown
        entry: mdmedic
        language: system
        types: [markdown]
```

## Why Another Markdown Linter?

`markdownlint-cli2` is fantastic, but:

1. **Configuration is complex** - Many options and rules to understand
2. **No built-in presets** - You need to build your config from scratch
3. **Missing common rules** - Like terminology enforcement

Markdown Medic provides:

- **Immediate value** - Sensible presets that just work
- **Easy adoption** - One command to get started
- **Extended functionality** - Custom rules for common needs
- **Full compatibility** - It's just markdownlint under the hood

## Advanced Usage

Since this is built on `markdownlint-cli2`, you can use all its features:

```bash
# Use markdownlint-cli2 options
mdmedic --no-globs docs/api.md

# Multiple config files
mdmedic --config .markdownlint.yaml --config .markdownlint.local.yaml

# Output formats
mdmedic --output results.json
```

See the [markdownlint-cli2 documentation](https://github.com/DavidAnson/markdownlint-cli2) for all available options.

## License

MIT
