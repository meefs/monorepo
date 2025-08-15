# Baselayer Dynamic Orchestration System

The orchestration system provides dynamic, configuration-driven coordination of development tools based on `baselayer.jsonc` settings.

## Architecture

### Core Components

1. **ConfigLoader**: Reads and parses `baselayer.jsonc` configuration files
2. **FileMatcher**: Categorizes files based on dynamic tool boundaries
3. **AdapterRegistry**: Manages tool adapters based on enabled features
4. **Orchestrator**: Coordinates tool execution with parallel processing

### Dynamic Tool Boundaries

When specific tools are disabled, other tools expand to handle their files:

- **Stylelint disabled** → Prettier handles CSS files (`.css`, `.scss`, `.sass`, `.less`)
- **Markdownlint disabled** → Prettier handles Markdown files (`.md`, `.mdx`, `.mdc`)

## Configuration

### baselayer.jsonc

```jsonc
{
  "features": {
    "typescript": true, // Ultracite for TS/JS files
    "markdown": true, // Markdownlint for .md files
    "styles": false, // Stylelint disabled - Prettier handles CSS
    "json": true, // Prettier for JSON/YAML
    "commits": true, // Commitlint via Lefthook
    "packages": false, // Publint for package validation
  },
  "overrides": {
    "prettier": {
      "tabWidth": 2,
      "singleQuote": true,
    },
  },
}
```

### Supported Configuration Paths

1. `baselayer.jsonc` (primary)
2. `baselayer.json`
3. `.baselayerrc.jsonc`
4. `.baselayerrc.json`
5. `outfitter.config.js` (legacy)

## Usage

### Basic Usage

```typescript
import { Orchestrator } from '@baselayer/orchestration';

const orchestrator = new Orchestrator();

// Initialize with configuration
await orchestrator.initialize();

// Format files
const result = await orchestrator.format(['**/*.{ts,js,css,md}']);

// Lint files
const lintResult = await orchestrator.lint(['src/**/*']);
```

### Advanced Configuration

```typescript
import { Orchestrator, type BaselayerConfig } from '@baselayer/orchestration';

const orchestrator = new Orchestrator();

// Custom configuration
const config: BaselayerConfig = {
  features: {
    typescript: true,
    styles: false, // Prettier will handle CSS
    markdown: false, // Prettier will handle Markdown
  },
  overrides: {
    prettier: { tabWidth: 4 },
  },
};

// Apply configuration
await orchestrator.reconfigure(config);

// Debug information
const summary = orchestrator.getSummary();
console.log(summary);
```

## Tool Adapters

### Available Adapters

- **UltraciteAdapter**: TypeScript/JavaScript formatting and linting
- **PrettierAdapter**: JSON, YAML, and dynamic file handling
- **StylelintAdapter**: CSS/SCSS linting (when enabled)
- **MarkdownlintAdapter**: Markdown linting (when enabled)
- **LefthookAdapter**: Git hooks management

### Dynamic Adapter Registration

Adapters are registered based on configuration:

```typescript
// When styles = false in config
const handlers = fileMatcher.getActiveHandlers();
console.log(handlers.json); // ['.json', '.yml', '.css', '.scss']
console.log(handlers.css); // [] (empty - stylelint disabled)
```

## File Processing Logic

### File Categorization Flow

1. **Load Configuration**: Parse `baselayer.jsonc`
2. **Update Handlers**: Adjust file patterns based on enabled/disabled tools
3. **Find Files**: Use glob patterns to discover files
4. **Categorize Files**: Route files to appropriate tool adapters
5. **Execute Tools**: Run tools in parallel with proper options

### Tool Boundary Examples

| Configuration                    | CSS Files → | Markdown Files → |
| -------------------------------- | ----------- | ---------------- |
| `styles: true, markdown: true`   | Stylelint   | Markdownlint     |
| `styles: false, markdown: true`  | Prettier    | Markdownlint     |
| `styles: true, markdown: false`  | Stylelint   | Prettier         |
| `styles: false, markdown: false` | Prettier    | Prettier         |

## Error Handling

The system uses the Result pattern for robust error handling:

```typescript
const result = await orchestrator.format(['**/*.ts']);

if (result.success) {
  console.log(`Formatted ${result.data.totalFiles} files`);
} else {
  console.error(`Error: ${result.error.message}`);
}
```

## Debugging

### Orchestration Summary

```typescript
const summary = orchestrator.getSummary();
console.log(summary);
// Output:
// {
//   configLoaded: true,
//   adapters: {
//     totalAdapters: 3,
//     adaptersByType: { typescript: 'ultracite', json: 'prettier' },
//     disabledFeatures: ['styles', 'markdown']
//   },
//   fileHandlers: {
//     typescript: ['.ts', '.tsx', '.js', '.jsx'],
//     json: ['.json', '.yml', '.css', '.md'], // Dynamic expansion
//     css: [],     // Empty - stylelint disabled
//     markdown: [] // Empty - markdownlint disabled
//   }
// }
```

### Adapter Registry Inspection

```typescript
const registry = orchestrator.getAdapterRegistry();
console.log(registry.getSummary());
```

## Migration Guide

### From Static Configuration

**Before (static):**

```typescript
orchestrator.registerAdapter('css', new StylelintAdapter());
orchestrator.registerAdapter('markdown', new MarkdownlintAdapter());
```

**After (dynamic):**

```typescript
// Configuration-driven - no manual registration needed
await orchestrator.initialize();
// Adapters automatically registered based on baselayer.jsonc
```

### Configuration File Migration

**Before (`outfitter.config.js`):**

```javascript
export default {
  features: {
    styles: true,
    markdown: true,
  },
};
```

**After (`baselayer.jsonc`):**

```jsonc
{
  "features": {
    "styles": true,
    "markdown": true,
  },
}
```

## Performance Considerations

- **Parallel Execution**: Tools run concurrently for different file types
- **Configuration Caching**: Configuration loaded once per orchestrator instance
- **Lazy Initialization**: Adapters created only when needed
- **File Filtering**: Files pre-filtered before tool execution

## Best Practices

1. **Initialize Once**: Call `orchestrator.initialize()` at startup
2. **Reuse Instances**: Create one orchestrator per project
3. **Handle Errors**: Always check Result success/failure
4. **Use Appropriate Patterns**: Specific glob patterns perform better
5. **Configure Thoughtfully**: Disable unused tools to improve performance
