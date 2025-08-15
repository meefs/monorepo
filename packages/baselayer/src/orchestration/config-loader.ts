import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { failure, makeError, type Result, success } from '@outfitter/contracts';
import { validateBaselayerConfig, type BaselayerConfig } from '../schemas/baselayer-config.js';
import type { FlintError } from '../types.js';

/**
 * Default configuration for Baselayer
 * Based on bun-monorepo template - single opinionated preset
 */
const DEFAULT_CONFIG: BaselayerConfig = {
  features: {
    typescript: true,
    markdown: true, 
    styles: false, // Opt-in for CSS projects
    json: true,
    commits: true,
    packages: false, // Opt-in for libraries
    testing: false, // Opt-in
    docs: false, // Opt-in
  },
  overrides: {},
};

export class ConfigLoader {
  /**
   * Load configuration from baselayer.jsonc or use defaults
   * Supports JSONC format with comments and trailing commas
   */
  async loadConfig(
    cwd: string = process.cwd()
  ): Promise<Result<BaselayerConfig, FlintError>> {
    const configPaths = [
      'baselayer.jsonc',
      'baselayer.json',
      '.baselayerrc.jsonc',
      '.baselayerrc.json',
      // Legacy support
      'outfitter.config.js',
      'outfitter.config.mjs',
    ];

    for (const configPath of configPaths) {
      const fullPath = join(cwd, configPath);

      try {
        const configContent = readFileSync(fullPath, 'utf-8');

        let userConfig: unknown;

        // Handle JSONC/JSON files
        if (configPath.endsWith('.json') || configPath.endsWith('.jsonc')) {
          userConfig = this.parseJsonc(configContent);
        } else {
          // Legacy JS module support
          const configModule = await import(fullPath);
          userConfig = configModule.default || configModule;
        }

        // Validate and merge with defaults
        const validatedConfig = validateBaselayerConfig(userConfig);
        const mergedConfig = this.mergeWithDefaults(validatedConfig);

        return success(mergedConfig);
      } catch (error) {
        // File doesn't exist, continue to next path
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          continue;
        }

        // Invalid config file
        return failure(
          makeError(
            'CONFIG_INVALID',
            `Failed to load config from ${configPath}: ${(error as Error).message}`
          )
        );
      }
    }

    // No config file found, use defaults
    return success(DEFAULT_CONFIG);
  }

  /**
   * Parse JSONC content (JSON with comments and trailing commas)
   */
  private parseJsonc(content: string): unknown {
    // Simple JSONC parser - removes single line comments and trailing commas
    const cleaned = content
      // Remove single line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove trailing commas before closing brackets/braces
      .replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(cleaned);
  }

  /**
   * Merge user configuration with defaults
   * Deep merge with user overrides taking precedence
   */
  private mergeWithDefaults(
    userConfig: Partial<BaselayerConfig>
  ): BaselayerConfig {
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      features: {
        ...DEFAULT_CONFIG.features,
        ...userConfig.features,
      },
      overrides: {
        ...DEFAULT_CONFIG.overrides,
        ...userConfig.overrides,
      },
    };
  }

  /**
   * Get default configuration
   * Useful for migration tools and init commands
   */
  getDefaultConfig(): BaselayerConfig {
    return structuredClone(DEFAULT_CONFIG);
  }

  /**
   * Get tool-specific overrides from configuration
   */
  getToolOverrides<T = Record<string, unknown>>(
    config: BaselayerConfig,
    toolName: keyof NonNullable<BaselayerConfig['overrides']>
  ): T | undefined {
    return config.overrides?.[toolName] as T | undefined;
  }

  /**
   * Check if a feature is enabled in the configuration
   */
  isFeatureEnabled(
    config: BaselayerConfig,
    feature: keyof NonNullable<BaselayerConfig['features']>
  ): boolean {
    return config.features?.[feature] ?? false;
  }
}
