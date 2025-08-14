# @outfitter/types

> Comprehensive TypeScript utilities combining type-fest with domain-specific types

## Installation

```bash
npm install @outfitter/types
# or
pnpm add @outfitter/types
# or
bun add @outfitter/types
```

## Overview

`@outfitter/types` provides a comprehensive collection of TypeScript utility types by combining:

- **All 152+ utility types from type-fest** - Battle-tested TypeScript utilities
- **Domain-specific types** - Web, API, and application-specific types
- **Branded types** - Re-exported from `@outfitter/contracts` for consistency
- **Advanced utilities** - Custom type transformations for complex scenarios

**Zero runtime dependencies** - This is a pure TypeScript package with only compile-time impact.

## Features

### 🎯 Complete type-fest Integration

Access all type-fest utilities directly:

```typescript
import type {
  CamelCase,
  PascalCase,
  ReadonlyDeep,
  Simplify,
} from '@outfitter/types';

type Example = CamelCase<'hello_world'>; // "helloWorld"
```

### 🏷️ Branded Types (from @outfitter/contracts)

Type-safe nominal types to prevent primitive obsession:

```typescript
import type { UserId, Email, Brand } from '@outfitter/types';
import { isEmail, createUserId } from '@outfitter/types';

// Re-exported from @outfitter/contracts for single source of truth
const userId = createUserId('user-123');
if (isEmail(input)) {
  // TypeScript knows input is Email brand here
}

// Web-specific branded types
import type { Slug, HexColor, ApiKey } from '@outfitter/types';
```

### 🌐 Domain-Specific Types

Ready-to-use types for web development:

```typescript
import type {
  HttpMethod,
  HttpStatus,
  MimeType,
  ApiResponse,
  PaginationRequest,
} from '@outfitter/types';
```

### 🔧 Advanced Utilities

Custom type transformations for complex scenarios:

```typescript
import type { DeepKeys, ExtractRouteParams } from '@outfitter/types';

// Deep object key extraction
type UserKeys = DeepKeys<{ user: { profile: { name: string } } }>;
// "user" | "user.profile" | "user.profile.name"

// Route parameter extraction
type Params = ExtractRouteParams<'/users/:id/posts/:postId'>;
// "id" | "postId"
```

## Subpath Exports

For optimal tree-shaking and organized imports:

```typescript
// Specific imports - better for bundle size
import type { Brand, UserId } from '@outfitter/types/core/branded';
import type { DeepKeys } from '@outfitter/types/utilities';
import type { HttpMethod } from '@outfitter/types/domains/web';

// Main barrel export (all types available)
import type { Brand, DeepKeys, HttpMethod } from '@outfitter/types';

// Namespace imports for organization
import type { Core, Utilities, Domains } from '@outfitter/types';
type UserId = Core.UserId;
type Keys = Utilities.DeepKeys<MyType>;
```

## Available Types

### From type-fest (152+ utilities)

All type-fest utilities are available. Key highlights:

```typescript
// String manipulation
type CamelCase<T> = ...
type PascalCase<T> = ...
type KebabCase<T> = ...

// Object manipulation
type ReadonlyDeep<T> = ...
type RequiredDeep<T> = ...
type PartialDeep<T> = ...

// Array/tuple utilities
type ArrayElement<T> = ...
type FirstArrayElement<T> = ...
type LastArrayElement<T> = ...

// Utility types
type Simplify<T> = ...
type UnionToIntersection<T> = ...
type IsEqual<A, B> = ...
```

### Branded Types (from @outfitter/contracts)

Core branded types for type safety:

```typescript
// Re-exported from contracts (single source of truth)
type Brand<T, TBrand> = T & { readonly __brand: TBrand };
type UserId = Brand<string, 'UserId'>;
type Email = Brand<string, 'Email'>;
type Url = Brand<string, 'Url'>;
type Uuid = Brand<string, 'Uuid'>;
type PositiveInteger = Brand<number, 'PositiveInteger'>;
type Percentage = Brand<number, 'Percentage'>;
type Timestamp = Brand<number, 'Timestamp'>;

// Web-specific branded types (types package only)
type Slug = Brand<string, 'Slug'>;
type HexColor = Brand<string, 'HexColor'>;
type Base64 = Brand<string, 'Base64'>;
type JwtToken = Brand<string, 'JwtToken'>;
type ApiKey = Brand<string, 'ApiKey'>;
type SemVer = Brand<string, 'SemVer'>;
type Port = Brand<number, 'Port'>;
```

### Domain Types

#### Web Types

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500 | ...; // Common status codes
type MimeType = 'application/json' | 'text/html' | 'text/plain' | ...;
```

#### API Types

```typescript
interface ApiRequest<TBody = JsonValue> {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: TBody;
}

interface ApiResponse<TData = JsonValue> {
  status: HttpStatus;
  headers?: Record<string, string>;
  data?: TData;
  error?: ApiError;
}

interface PaginationRequest {
  page?: number;
  limit?: number;
  cursor?: string;
}
```

### Advanced Utilities

```typescript
// Deep object key paths
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? `${K}` | `${K}.${DeepKeys<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

// Extract route parameters
type ExtractRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${infer _Start}:${infer Param}`
      ? Param
      : never;
```

## Usage Examples

### Type-safe API Responses

```typescript
import type { ApiResponse, HttpStatus, UserId } from '@outfitter/types';

interface User {
  id: UserId;
  name: string;
  email: string;
}

type UserResponse = ApiResponse<User>;

const response: UserResponse = {
  status: 200 as HttpStatus,
  data: {
    id: 'user-123' as UserId,
    name: 'John Doe',
    email: 'john@example.com',
  },
};
```

### Route Parameter Extraction

```typescript
import type { ExtractRouteParams } from '@outfitter/types';

type UserRoute = '/users/:userId/posts/:postId';
type RouteParams = ExtractRouteParams<UserRoute>; // "userId" | "postId"

function handleRoute(params: Record<RouteParams, string>) {
  // params.userId and params.postId are available and type-safe
}
```

### Deep Object Keys

```typescript
import type { DeepKeys } from '@outfitter/types';

interface Config {
  server: {
    port: number;
    host: string;
    ssl: {
      cert: string;
      key: string;
    };
  };
  database: {
    url: string;
  };
}

type ConfigKeys = DeepKeys<Config>;
// "server" | "server.port" | "server.host" | "server.ssl" |
// "server.ssl.cert" | "server.ssl.key" | "database" | "database.url"
```

### Branded Type Safety

```typescript
import type { UserId, Email } from '@outfitter/types';
import { createUserId, isEmail } from '@outfitter/types';

// Prevent accidental mixing of string types
function sendNotification(userId: UserId, email: Email) {
  // Implementation
}

const userId = createUserId('user-123');
const email = 'user@example.com';

if (isEmail(email)) {
  sendNotification(userId, email); // ✅ Type safe
}

// sendNotification('user-456', 'not-validated@email.com'); // ❌ Type error
```

## Architecture

This package follows a clear separation of concerns:

- **@outfitter/types**: Compile-time utilities and type definitions (this package)
- **@outfitter/contracts**: Runtime behavior patterns (Result, errors, branded type creators)
- **@outfitter/contracts/zod**: Runtime validation with Zod schemas

### Branded Types Strategy

To avoid duplication, branded types are re-exported from `@outfitter/contracts`:

- **Core branded types** (UserId, Email, etc.) come from contracts
- **Web-specific types** (Slug, HexColor, etc.) are defined in types
- **Single source of truth** prevents inconsistencies

### Conflict Resolution

When type-fest and our custom types have naming conflicts (like `NonEmptyString`), we:

1. Prefer type-fest versions in the main export
2. Provide our versions via explicit subpath imports
3. Document the differences clearly

## Best Practices

### 1. Use Branded Types for Domain Concepts

```typescript
// ❌ Primitive obsession
function getUserPosts(userId: string): Post[] { ... }

// ✅ Branded types prevent errors
function getUserPosts(userId: UserId): Post[] { ... }
```

### 2. Leverage Deep Type Utilities

```typescript
// Extract nested configuration types safely
type ServerConfig = DeepKeys<AppConfig> extends `server.${infer K}` ? K : never;
```

### 3. Use Subpath Imports for Large Applications

```typescript
// Better tree-shaking in large apps
import type { Brand } from '@outfitter/types/core/branded';
import type { HttpMethod } from '@outfitter/types/domains/web';
```

## Dependencies

- **type-fest**: ^4.41.0 (provides 152+ utility types)
- **@outfitter/contracts**: workspace:\* (for branded types)

Zero runtime dependencies - purely compile-time utilities.

## Development

This package is part of the [@outfitter/monorepo](https://github.com/outfitter-dev/monorepo).

```bash
# Install dependencies
bun install

# Build package
bun run build

# Run tests
bun run test

# Type check
bun run type-check
```

## License

MIT
