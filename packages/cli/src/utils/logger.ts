/**
 * Simple logger abstraction for CLI operations
 * 
 * This is intentionally using console.log as per the project's LOGGING rules:
 * CLI tools are allowed and encouraged to use console.log for user feedback.
 * 
 * This abstraction provides:
 * - Consistent formatting across CLI commands
 * - Easy testing by allowing logger injection
 * - Clear separation between user output and debug output
 */

import chalk from 'chalk';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
  log(message: string): void;
  newline(): void;
}

/**
 * Default CLI logger using console
 * Uses chalk for colored output and follows CLI UX patterns
 */
export class ConsoleLogger implements Logger {
  info(message: string): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.log(message);
  }

  success(message: string): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.log(chalk.green(message));
  }

  error(message: string): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.error(chalk.red(message));
  }

  warn(message: string): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.warn(chalk.yellow(message));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      // biome-ignore lint/suspicious/noConsole: CLI tool debug output - see .agent/rules/LOGGING.md
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  log(message: string): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.log(message);
  }

  newline(): void {
    // biome-ignore lint/suspicious/noConsole: CLI tool output - see .agent/rules/LOGGING.md
    console.log();
  }
}

/**
 * Silent logger for testing
 * Captures all output instead of printing it
 */
export class SilentLogger implements Logger {
  public output: string[] = [];
  public errors: string[] = [];

  info(message: string): void {
    this.output.push(message);
  }

  success(message: string): void {
    this.output.push(message);
  }

  error(message: string): void {
    this.errors.push(message);
  }

  warn(message: string): void {
    this.output.push(message);
  }

  debug(message: string): void {
    this.output.push(message);
  }

  log(message: string): void {
    this.output.push(message);
  }

  newline(): void {
    this.output.push('');
  }

  clear(): void {
    this.output = [];
    this.errors = [];
  }
}

// Default logger instance
export const logger = new ConsoleLogger();