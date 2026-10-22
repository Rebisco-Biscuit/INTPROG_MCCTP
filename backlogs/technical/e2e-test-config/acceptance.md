# TECH-01: Technical — E2E Test Configuration (Jest ESM Compatibility)

| Field       | Value                                                        |
|-------------|--------------------------------------------------------------|
| Category    | Technical Debt / Infrastructure                              |
| Priority    | Medium                                                       |
| Discovered  | 2026-10-20                                                   |
| Affected    | `backend-nestjs/test/jest-e2e.json`                          |
| Status      | NOT STARTED                                                  |
| Assignee    | Unassigned                                                   |

---

## Problem

The backend e2e test suite (`npm run test:e2e`) fails before any test executes. Jest cannot parse the `@nestjs/config` package because it ships ESM (`export *` syntax), but the current `jest-e2e.json` config does not transform `node_modules` that use ESM.

### Error

```
SyntaxError: Unexpected token 'export'

  at node_modules/@nestjs/config/dist/index.js:1
     export * from './conditional.module.js';
     ^^^^^^
```

### Root Cause

`jest-e2e.json` uses `ts-jest` to transform `.ts` and `.js` files, but the default `transformIgnorePatterns` excludes the entire `node_modules/` directory. Packages like `@nestjs/config` that ship pure ESM are never transformed, causing the `export` syntax error.

---

## Acceptance Criteria

| #  | Criteria                                                                 | Status      | Notes |
|----|-------------------------------------------------------------------------|-------------|-------|
| 1  | `npm run test:e2e` runs without ESM parse errors                        | NOT STARTED | —     |
| 2  | `transformIgnorePatterns` updated to allow ESM packages through ts-jest  | NOT STARTED | —     |
| 3  | Default e2e spec (`app.e2e-spec.ts`) passes or is updated               | NOT STARTED | —     |
| 4  | Unit tests (`npm test`) remain unaffected                               | NOT STARTED | —     |

---

## Suggested Fix

Update `backend-nestjs/test/jest-e2e.json` to add a `transformIgnorePatterns` that excludes `node_modules` except ESM-only NestJS packages:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(@nestjs/config)/)"
  ]
}
```

Additional ESM packages may need to be added to the exclusion pattern as dependencies update.

---

## Summary: 0/4 PASS, 0 PARTIAL, 0 FAIL — NOT STARTED
