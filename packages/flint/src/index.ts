/**
 * @outfitter/flint - Unified formatting and linting setup
 *
 * This is the programmatic API for Flint.
 * For CLI usage, use the `flint` command.
 */

export { clean } from './commands/clean.js';
export { doctor } from './commands/doctor.js';
export { init } from './commands/init.js';
// Export core utilities for programmatic usage
export * from './core/index.js';
// Export types
export type { CleanOptions, DoctorOptions, InitOptions } from './types.js';
export * from './utils/index.js';
