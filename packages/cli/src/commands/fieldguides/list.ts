import chalk from 'chalk';
import fsExtra from 'fs-extra';
import { logger } from '../../utils/logger.js';

const { readJSON, pathExists } = fsExtra;

import { join } from 'node:path';

interface OutfitterConfig {
  fieldguides?: Array<string>;
  supplies?: Array<string>; // Legacy support
}

// TODO: This would come from a registry or the fieldguides package
const availableFieldguides: Record<string, string> = {
  'typescript-standards': 'Core TypeScript patterns and conventions',
  'react-patterns': 'React component and hook patterns',
  'nextjs-patterns': 'Next.js specific patterns and best practices',
  'testing-standards': 'Comprehensive testing methodology',
  'security-standards': 'Security baseline and best practices',
  'react-hook-form': 'Form handling with React Hook Form',
  'react-query': 'Data fetching with React Query',
  'zustand-guide': 'State management with Zustand',
  'vitest-guide': 'Testing with Vitest',
  'playwright-guide': 'E2E testing with Playwright',
};

/**
 * Lists fieldguides that are either installed locally or available for installation.
 *
 * Depending on the {@link options.installed} flag, displays either the installed fieldguides or all available fieldguides with their descriptions, highlighting which are installed.
 *
 * @param options - If `installed` is true, only lists installed fieldguides; otherwise, lists all available fieldguides and their installation status.
 */
export async function listFieldguides(options: {
  installed?: boolean;
}): Promise<void> {
  const cwd = process.cwd();
  const configPath = join(cwd, '.outfitter', 'config.json');

  let installedFieldguides: Array<string> = [];

  try {
    if (await pathExists(configPath)) {
      const config = (await readJSON(configPath)) as OutfitterConfig;
      installedFieldguides = config.fieldguides || config.supplies || []; // Support old 'supplies' key for backwards compatibility
    }
  } catch (e) {
    logger.error(
      `Failed to read .outfitter/config.json: ${(e as Error).message}`
    );
    return;
  }

  if (options.installed) {
    if (installedFieldguides.length === 0) {
      logger.warn('No fieldguides installed yet.');
      return;
    }

    logger.info(chalk.cyan('Installed fieldguides:'));
    logger.newline();
    installedFieldguides.forEach((fieldguide) => {
      logger.log(`  ${chalk.green('✓')} ${fieldguide}`);
    });
  } else {
    logger.info(chalk.cyan('Available fieldguides:'));
    logger.newline();
    Object.entries(availableFieldguides).forEach(
      ([fieldguide, description]) => {
        const isInstalled = installedFieldguides.includes(fieldguide);
        const status = isInstalled ? chalk.green('✓') : chalk.gray('○');
        const name = isInstalled ? chalk.green(fieldguide) : fieldguide;
        logger.log(`  ${status} ${name}`);
        logger.log(`    ${chalk.gray(description)}`);
        logger.newline();
      }
    );

    if (installedFieldguides.length === 0) {
      logger.warn(
        'No fieldguides installed yet. Run "outfitter fg add <fieldguide>" to get started.'
      );
    }
  }
}
