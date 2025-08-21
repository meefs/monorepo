import chalk from 'chalk';
import fsExtra from 'fs-extra';
import { ErrorCode, failure, type Result, success, makeError, type AppError } from '@outfitter/contracts';
import { logger } from '../../utils/logger.js';

const { readJSON, writeJSON, pathExists } = fsExtra;

import { join } from 'node:path';

interface ExportOptions {
  output: string;
}

interface ImportOptions {
  file: string;
}

interface OutfitterConfig {
  fieldguides?: Array<string>;
  supplies?: Array<string>; // Legacy support
  name?: string;
  version?: string;
}

/**
 * Imports or exports a fieldguide configuration file based on the specified action.
 *
 * For 'export', writes the current local fieldguide configuration to a specified output file, including metadata and supporting legacy keys.
 * For 'import', reads a configuration file, validates its structure, and prepares to initialize or update the local configuration.
 *
 * @param action - The operation to perform: 'export' or 'import'.
 * @param options - Options for the chosen action. For 'export', specifies the output file path; for 'import', specifies the input file path.
 *
 * @returns Result indicating success with optional message or error
 */
export async function manageFieldguideConfig(
  action: 'export' | 'import',
  options: ExportOptions | ImportOptions
): Promise<Result<string, AppError>> {
  try {
    const cwd = process.cwd();
    const configPath = join(cwd, '.outfitter', 'config.json');

    if (action === 'export') {
      const { output } = options as ExportOptions;

      if (!(await pathExists(configPath))) {
        return failure(
          makeError(
            ErrorCode.NOT_FOUND,
            'No fieldguide configuration found. Run "outfitter fg create" first.'
          )
        );
      }

      const config = (await readJSON(configPath)) as OutfitterConfig;

      const exportConfig = {
        name: 'Custom Fieldguide Configuration',
        version: '1.0.0',
        fieldguides: config.fieldguides || config.supplies || [], // Support old 'supplies' key
        created: new Date().toISOString(),
      };

      await writeJSON(join(cwd, output), exportConfig, { spaces: 2 });

      return success(
        `Exported fieldguide configuration to ${output}`
      );
    } else if (action === 'import') {
      const { file } = options as ImportOptions;
      const importPath = join(cwd, file);

      if (!(await pathExists(importPath))) {
        return failure(
          makeError(
            ErrorCode.NOT_FOUND,
            `Configuration file not found: ${file}`
          )
        );
      }

      const importConfig = (await readJSON(importPath)) as OutfitterConfig;

      if (
        !(
          (importConfig.fieldguides || importConfig.supplies) &&
          Array.isArray(importConfig.fieldguides || importConfig.supplies)
        )
      ) {
        return failure(
          makeError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid configuration format'
          )
        );
      }

      // Initialize if needed
      if (!(await pathExists(configPath))) {
        // TODO: Create minimal config
        logger.warn('Initializing fieldguide configuration...');
      }

      const fieldguideCount = (
        importConfig.fieldguides ||
        importConfig.supplies ||
        []
      ).length;
      
      return success(
        `Imported ${fieldguideCount} fieldguides from ${importConfig.name || 'configuration'}`
      );
    }

    return failure(
      makeError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid action: ${action}`
      )
    );
  } catch (error) {
    return failure(
      makeError(
        ErrorCode.INTERNAL_ERROR,
        `Configuration management failed: ${error instanceof Error ? error.message : String(error)}`
      )
    );
  }
}
