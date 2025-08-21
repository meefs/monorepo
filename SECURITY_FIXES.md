# Security Fixes Applied

This documents the security and compatibility fixes that were applied based on CodeRabbit review feedback from PR #84.

## Fixes Applied

### 1. Package Manager Command Compatibility

- Fixed yarn/pnpm/bun to use 'add' instead of 'install' when adding new packages
- Implemented proper dev/exact flag handling per package manager
  - npm/pnpm: `--save-dev` and `--save-exact`
  - yarn/bun: `--dev` and `--exact`

### 2. Shell Injection Prevention

- Replaced string concatenation with argument arrays in spawnSync calls
- Removed shell execution to prevent command injection vulnerabilities
- Fixed Bun.$ argument handling to avoid shell injection

### 3. Cross-Platform Compatibility

- Fixed 'command -v' invocation on POSIX systems using `sh -c`
- Added proper signal termination handling in spawnSync results
- Improved environment variable handling with trimming

### 4. Type Safety Improvements

- Removed unused InstallerError type and aligned with @outfitter/contracts
- Fixed 'vi' export typing in testing-react-utils.tsx
- Fixed potential TypeError when spreading undefined dependencies objects
- Updated error handling to use proper TypeScript patterns

### 5. Testing Improvements

- Replaced BrowserRouter with MemoryRouter for better test isolation
- Fixed test glob patterns to match actual directory structure

### 6. Configuration Detection

- Added support for reading package.json 'packageManager' field
- Improved version parsing to handle 'v' prefix and pre-release tags

### 7. CI/CD Improvements

- Use `npm ci` in CI environments for reproducibility
- Added proper CI flag detection and handling

## Files Modified

- `packages/baselayer/src/core/installer.ts`
- `packages/baselayer/src/utils/package-manager.ts`
- `packages/cli/src/services/package-manager.ts`
- `packages/baselayer/templates/testing-jest-config.ts`
- `packages/baselayer/templates/testing-react-utils.tsx`

## Status

These fixes have been successfully merged into main through PRs #82 and #83.
