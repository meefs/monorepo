import type { BiomeConfig, OutfitterConfig } from '../types/index.js';

/**
 * Generates Biome configuration from OutfitterConfig
 */
export function generateBiomeConfig(config: OutfitterConfig): BiomeConfig {
  const { codeStyle, strictness, overrides } = config;

  // Base configuration from declarative preferences
  const baseConfig: BiomeConfig = {
    $schema: 'https://biomejs.dev/schemas/latest/schema.json',
    root: true,
    vcs: {
      enabled: true,
      clientKind: 'git',
      defaultBranch: 'main',
      useIgnoreFile: true,
    },
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: codeStyle.indentWidth,
      lineEnding: 'lf',
      lineWidth: codeStyle.lineWidth,
    },
    linter: {
      enabled: true,
      rules: generateLinterRules(strictness),
    },
    javascript: {
      formatter: {
        jsxQuoteStyle: codeStyle.quoteStyle === 'single' ? 'single' : 'double',
        quoteProperties: 'asNeeded',
        quoteStyle: codeStyle.quoteStyle,
        semicolons: codeStyle.semicolons,
        trailingCommas: codeStyle.trailingCommas,
        arrowParentheses: 'always',
      },
      parser: {
        unsafeParameterDecoratorsEnabled: true,
      },
    },
    json: {
      parser: {
        allowComments: true,
        allowTrailingCommas: true,
      },
    },
    files: {
      maxSize: 1048576,
      ignoreUnknown: false,
    },
  };

  // The config object is already merged with overrides.
  // We apply the overrides to the base config here.
  // A proper deep merge is required.
  const biomeOverrides = overrides?.biome ?? {};
  return {
    ...baseConfig,
    ...biomeOverrides,
    formatter: {
      ...baseConfig.formatter,
      ...biomeOverrides.formatter,
    },
    linter: {
      ...baseConfig.linter,
      ...biomeOverrides.linter,
      rules: {
        ...(baseConfig.linter?.rules ?? {}),
        ...(biomeOverrides.linter?.rules ?? {}),
      },
    },
    javascript: {
      ...baseConfig.javascript,
      ...biomeOverrides.javascript,
      formatter: {
        ...(baseConfig.javascript?.formatter ?? {}),
        ...(biomeOverrides.javascript?.formatter ?? {}),
      },
    },
  };
}

/**
 * Generate linter rules based on strictness level
 */
function generateLinterRules(strictness: OutfitterConfig['strictness']) {
  const baseRules = {
    recommended: true,
    suspicious: {
      noExplicitAny: strictness === 'pedantic' ? 'error' : 'warn',
      noConsole: 'off', // Allow console in development
      noArrayIndexKey: 'warn',
      noAssignInExpressions: 'warn',
    },
    style: {
      noParameterAssign: 'error',
      useConst: 'error',
    },
    complexity: {
      noBannedTypes: 'error',
      noUselessConstructor: 'error',
    },
    correctness: {
      noUnusedVariables: strictness === 'relaxed' ? 'warn' : 'error',
      noUnusedFunctionParameters: 'warn',
    },
    performance: {
      noAccumulatingSpread: 'error',
      noDelete: 'error',
    },
    security: {
      noDangerouslySetInnerHtml: 'error',
    },
    nursery: {},
  };

  // Adjust rules based on strictness
  if (strictness === 'pedantic') {
    baseRules.suspicious.noConsole = 'error';
    baseRules.correctness.noUnusedFunctionParameters = 'error';
  } else if (strictness === 'relaxed') {
    baseRules.suspicious.noExplicitAny = 'off';
    baseRules.correctness.noUnusedVariables = 'warn';
  }

  return baseRules;
}
