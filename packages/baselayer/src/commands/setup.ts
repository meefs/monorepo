import { failure, isFailure, makeError, success } from '@outfitter/contracts';
import { LefthookAdapter } from '../adapters/lefthook-adapter.js';
import { generateLefthookConfig } from '../generators/lefthook.js';
import type { FlintResult } from '../types.js';

export interface SetupOptions {
  force?: boolean;
  skipHooks?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Setup command - Initialize Flint configuration and git hooks
 * Generates lefthook.yml and installs git hooks
 */
export async function setup(
  options: SetupOptions = {}
): Promise<FlintResult<void>> {
  try {
    const {
      force = false,
      skipHooks = false,
      dryRun = false,
      verbose = false,
    } = options;

    if (verbose) {
    }

    // Step 1: Generate Lefthook configuration
    if (verbose) {
    }

    if (dryRun) {
    } else {
      const configResult = await generateLefthookConfig();
      if (isFailure(configResult)) {
        return failure(
          makeError(
            'SETUP_FAILED',
            `Failed to generate Lefthook configuration: ${configResult.error.message}`
          )
        );
      }
    }

    // Step 2: Install git hooks (unless skipped)
    if (skipHooks) {
      if (verbose) {
      }
    } else {
      if (verbose) {
      }

      if (dryRun) {
      } else {
        const lefthookAdapter = new LefthookAdapter();
        const installResult = await lefthookAdapter.install();

        if (!installResult.success) {
          return failure(
            makeError(
              'SETUP_FAILED',
              `Failed to install git hooks: ${installResult.errors.join(', ')}`
            )
          );
        }

        if (verbose && installResult.output) {
        }
      }
    }

    // Step 3: Verify setup
    if (!(dryRun || skipHooks)) {
      if (verbose) {
      }

      const lefthookAdapter = new LefthookAdapter();
      const checkResult = await lefthookAdapter.check([]);

      if (!checkResult.success) {
      } else if (verbose) {
      }
    }

    // Success message
    if (dryRun) {
    } else {
    }

    return success(undefined);
  } catch (error) {
    return failure(
      makeError(
        'SETUP_FAILED',
        `Setup failed with unexpected error: ${(error as Error).message}`
      )
    );
  }
}

/**
 * Check if Lefthook is available in the system
 */
export async function checkLefthookAvailability(): Promise<
  FlintResult<boolean>
> {
  try {
    const lefthookAdapter = new LefthookAdapter();
    const result = await lefthookAdapter.check([]);

    if (result.success) {
      return success(true);
    }
    return success(false);
  } catch (error) {
    return failure(
      makeError(
        'CHECK_FAILED',
        `Failed to check Lefthook availability: ${(error as Error).message}`
      )
    );
  }
}

/**
 * Uninstall git hooks
 */
export async function teardown(
  options: { verbose?: boolean } = {}
): Promise<FlintResult<void>> {
  try {
    const { verbose = false } = options;

    if (verbose) {
    }

    const lefthookAdapter = new LefthookAdapter();
    const uninstallResult = await lefthookAdapter.uninstall();

    if (!uninstallResult.success) {
      return failure(
        makeError(
          'TEARDOWN_FAILED',
          `Failed to uninstall git hooks: ${uninstallResult.errors.join(', ')}`
        )
      );
    }

    if (verbose && uninstallResult.output) {
    }

    return success(undefined);
  } catch (error) {
    return failure(
      makeError(
        'TEARDOWN_FAILED',
        `Teardown failed with unexpected error: ${(error as Error).message}`
      )
    );
  }
}
