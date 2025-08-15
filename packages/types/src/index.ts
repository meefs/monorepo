/**
 * @outfitter/types - Modern TypeScript utilities
 * 
 * Combines type-fest's comprehensive utilities with domain-specific types.
 * Zero runtime dependencies.
 */

// Re-export the entire type-fest library
export * from 'type-fest';

// Our domain-specific utilities and types
export * from './utilities/index.js';
export * from './domains/index.js';

// Core types - handle conflicts with type-fest
export type {
  // Branded types that don't conflict
  Brand,
  Unbrand,
  UserId,
  Email,
  Url,
  Uuid,
  PositiveInteger,
  Percentage,
  Timestamp,
  // Web-specific types
  Slug,
  HexColor,
  Base64,
  JwtToken,
  ApiKey,
  SemVer,
  Port,
} from './core/index.js';

export {
  // Functions that don't conflict
  createUserId,
  createEmail,
  createUrl,
  createUuid,
  createPositiveInteger,
  createPercentage,
  createTimestamp,
  createBrandedType,
  isUserId,
  isEmail,
  isUrl,
  isUuid,
  isPositiveInteger,
  isPercentage,
  isTimestamp,
  isSlug,
  isHexColor,
  isBase64,
  isSemVer,
  isPort,
  brand,
} from './core/index.js';

// For conflicting types, prefer type-fest versions
// If you need the contracts versions, import from './core/branded' directly

// Namespace exports for organized access
export * as Utilities from './utilities/index.js';
export * as Core from './core/index.js';
export * as Domains from './domains/index.js';