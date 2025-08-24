import { $ } from 'bun';
import { failure, type Result, success } from '@outfitter/contracts';
import type { BaselayerConfig } from '../schemas/baselayer-config.js';

interface BiomeConfig {
  $schema: string;
  extends: string[];
  javascript?: {
    globals: string[];
  };
  json?: {
    parser: {
      allowComments: boolean;
      allowTrailingCommas: boolean;
    };
  };
  files?: {
    ignoreUnknown?: boolean;
    ignore?: string[];
  };
  vcs?: {
    useIgnoreFile: boolean;
  };
  [key: string]: unknown;
}

/**
 * Generate biome.json configuration with Ultracite zero-config approach
 * 
 * When using Ultracite, we should use minimal configuration and let
 * the preset handle all the rule configurations. This makes the setup
 * more durable and automatically compatible with Biome updates.
 */
export function generateBiomeConfig(config?: BaselayerConfig): string {
  // Use latest Biome schema version
  // Note: Ultracite will handle all rule configurations
  const base: BiomeConfig = {
    $schema: 'https://biomejs.dev/schemas/2.2.0/schema.json',
    extends: ['ultracite'],
  };

  // Only add project-specific configuration that doesn't conflict with Ultracite
  
  // Add global variables if needed (e.g., for Bun projects)
  if (config?.project?.packageManager === 'bun') {
    base.javascript = {
      globals: ['Bun'],
    };
  }

  // Add JSON parser settings for better developer experience
  base.json = {
    parser: {
      allowComments: true,
      allowTrailingCommas: true,
    },
  };

  // Configure file handling
  const files: NonNullable<BiomeConfig['files']> = {
    ignoreUnknown: true,
  };

  // Only add ignore patterns if custom ones are provided
  // Let Ultracite handle the default ignores
  if (config?.ignore && config.ignore.length > 0) {
    files.ignore = config.ignore;
  }

  // For monorepos, add specific ignore patterns
  if (config?.project?.type === 'monorepo') {
    files.ignore = files.ignore || [];
    files.ignore.push('packages/**/node_modules/**');
  }

  // Always add files config if we have any settings
  base.files = files;

  // Enable VCS integration for better Git support
  base.vcs = {
    useIgnoreFile: true,
  };

  // Apply user overrides last (but warn that this might conflict with Ultracite)
  let finalConfig = base;
  if (config?.overrides?.biome) {
    finalConfig = { ...base, ...config.overrides.biome };
  }

  return JSON.stringify(finalConfig, null, 2);
}

/**
 * Install Biome via Ultracite and create configuration
 */
export async function installBiomeConfig(config?: BaselayerConfig): Promise<Result<void, Error>> {
  try {
    // Ultracite init handles installation and basic setup
    await $({
      env: { ...process.env, FORCE_COLOR: '1' },
      stdio: ['inherit', 'inherit', 'inherit'],
    })`bunx ultracite init --yes`;
    return success(undefined);
  } catch (error) {
    const e = error as any;
    const enriched = new Error(
      `Failed to initialise Biome via Ultracite (command: "bunx ultracite init --yes", status: ${e?.status ?? 'unknown'}, signal: ${e?.signal ?? 'unknown'})`,
      { cause: e as Error }
    );
    return failure(enriched);
  }
}

// Maintain backward compatibility
export const generateBiomeConfigLegacy = installBiomeConfig;
