import { execSync } from 'node:child_process';
import { failure, type Result, success } from '@outfitter/contracts';
import * as pc from 'picocolors';

/**
 * Generates Biome configuration by delegating to Ultracite init
 * Ultracite handles:
 * - Installing biome and ultracite
 * - Creating biome.jsonc with extends: ["ultracite"]
 * - Setting up VS Code integration
 * - Configuring git hooks if husky exists
 */
export async function generateBiomeConfig(): Promise<Result<void, Error>> {
  try {
    console.log(pc.blue('→ Setting up Biome via Ultracite...'));

    // Ultracite init handles everything for Biome setup
    execSync('bunx ultracite init --yes', {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    console.log(pc.green('✓ Biome configured successfully'));
    return success(undefined);
  } catch (error) {
    const err = error as Error;
    return failure(err);
  }
}
