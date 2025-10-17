# 🛠️ Recommended Tooling & Libraries

**For EasyPost MCP Server Project**  
**Research Date:** October 17, 2025

---

## 🎯 Quick Install Commands

### **Essential Tools (Install First)**
```bash
# Modern build tool (10-100x faster than tsc)
pnpm add -D tsup

# Path alias resolution at runtime
pnpm add -D tsconfig-paths

# Pre-commit hooks for quality
pnpm add -D husky lint-staged

# API documentation generator
pnpm add -D typedoc
```

### **Advanced Error Handling**
```bash
# Functional effects for better error handling
pnpm add effect

# Schema validation (already installed)
# pnpm add zod
```

### **Performance & Monitoring**
```bash
# Node.js performance profiling
pnpm add -D clinic

# Bundle analysis
pnpm add -D @vercel/ncc
```

---

## 📦 Detailed Tool Breakdown

### **1. TSup - Modern TypeScript Bundler**

**Why:** 10-100x faster than `tsc`, zero config, better DX

**Installation:**
```bash
pnpm add -D tsup
```

**Configuration:** Create `tsup.config.ts`
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,          // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,      // Set to true for production
  outDir: 'dist',
  target: 'es2022',
  platform: 'node',
});
```

**Update package.json:**
```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch"
  }
}
```

**Benefits:**
- ⚡ **Fast:** 10-100x faster compilation
- 📦 **Small bundles:** Automatic tree-shaking
- 🔄 **Watch mode:** Instant rebuilds
- 🎯 **Zero config:** Works out of the box

---

### **2. Husky + Lint-Staged - Pre-commit Hooks**

**Why:** Enforce code quality before commits, prevent bad code from entering repo

**Installation:**
```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Setup:** Add to `package.json`
```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run --bail"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Create `.husky/pre-commit`:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

**Benefits:**
- 🔒 **Quality gate:** No bad code enters repo
- ⚡ **Fast:** Only checks changed files
- 🎯 **Automatic:** Developers don't need to remember
- 🧪 **Tests:** Run relevant tests only

---

### **3. TypeDoc - API Documentation**

**Why:** Auto-generate beautiful documentation from TypeScript comments

**Installation:**
```bash
pnpm add -D typedoc
```

**Configuration:** Create `typedoc.json`
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": [],
  "exclude": ["**/*.test.ts", "**/node_modules/**"],
  "excludePrivate": true,
  "includeVersion": true,
  "readme": "README.md",
  "navigation": {
    "includeCategories": true
  }
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "docs": "typedoc",
    "docs:watch": "typedoc --watch"
  }
}
```

**Usage in code:**
```typescript
/**
 * Create a complete shipping label with customs declarations.
 * 
 * @param args - Shipping label input parameters
 * @param args.inputData - Shipping data in JSON, CSV, or text format
 * @param args.serviceLevel - Optional service level (ground, express, priority)
 * @returns Promise with shipping label result
 * 
 * @example
 * ```typescript
 * const label = await createShippingLabel({
 *   inputData: '{"to": {...}, "weight": 5}',
 *   serviceLevel: 'ground'
 * });
 * ```
 */
export async function createShippingLabel(args: ShippingLabelArgs): Promise<LabelResult> {
  // ...
}
```

**Benefits:**
- 📚 **Automatic:** Synced with code
- 🎨 **Beautiful:** Clean HTML output
- 🔍 **Searchable:** Full-text search
- 📊 **Examples:** Include usage examples

---

### **4. Effect-TS - Functional Error Handling**

**Why:** Type-safe error handling, better than try/catch

**Installation:**
```bash
pnpm add effect
```

**Example usage:**
```typescript
import { Effect, Console } from 'effect';

// Define a computation that can fail
const fetchShippingRates = Effect.tryPromise({
  try: () => easyPostClient.getRates(shipmentId),
  catch: (error) => new RateFetchError({ cause: error })
});

// Compose effects
const program = Effect.gen(function* (_) {
  const rates = yield* _(fetchShippingRates);
  yield* _(Console.log(`Found ${rates.length} rates`));
  return rates[0];
});

// Run with error handling
const result = await Effect.runPromise(program);
```

**Benefits:**
- ✅ **Type-safe errors:** Errors are part of the type
- 🔄 **Composable:** Chain operations easily
- 🧪 **Testable:** Mock dependencies cleanly
- 📊 **Structured:** Better than try/catch hell

**Gradual adoption:**
```typescript
// Wrap existing async code
export function createShippingLabel(args: any) {
  return Effect.tryPromise({
    try: async () => {
      // Your existing code here
      const client = new EasyPostClient();
      return await client.createShipment(args);
    },
    catch: (error) => new ShipmentCreationError({ cause: error })
  });
}

// Use it
const result = await Effect.runPromise(createShippingLabel(args));
```

---

### **5. Changesets - Version Management**

**Why:** Automated changelog and semantic versioning

**Installation:**
```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

**Workflow:**
```bash
# 1. Make changes to code
# 2. Create a changeset
pnpm changeset

# Prompts:
# - What type of change? (patch/minor/major)
# - Summary of changes?

# 3. Commit changeset
git add .changeset
git commit -m "Add rate fetching feature"

# 4. When ready to release
pnpm changeset version  # Updates package.json & CHANGELOG.md
pnpm changeset publish  # Publishes to npm (if applicable)
```

**Benefits:**
- 📝 **Automatic changelog:** Generated from changesets
- 🏷️ **Semantic versioning:** Enforced automatically
- 👥 **Team-friendly:** Everyone creates changesets
- 🔄 **Git-based:** Version control for changes

---

### **6. TSConfig Paths - Path Alias Resolution**

**Why:** Make path aliases work at runtime

**Installation:**
```bash
pnpm add -D tsconfig-paths
```

**Update package.json:**
```json
{
  "scripts": {
    "start": "node -r tsconfig-paths/register dist/index.js",
    "dev": "tsx --tsconfig-paths src/index.ts"
  }
}
```

**Or use programmatically:**
```typescript
// src/index.ts (first line)
import 'tsconfig-paths/register';

// Now path aliases work!
import { createShippingLabel } from '@/tools/shipping-labels';
```

**Benefits:**
- 🎯 **Clean imports:** Use `@/tools/*` instead of `../../../tools/*`
- 🔄 **Refactor-safe:** Move files without breaking imports
- 📦 **IDE support:** Works with autocomplete

---

### **7. Clinic.js - Performance Profiling**

**Why:** Find performance bottlenecks in Node.js

**Installation:**
```bash
pnpm add -D clinic
```

**Usage:**
```bash
# Profile your application
clinic doctor -- node dist/index.js

# Memory leaks
clinic heapprofiler -- node dist/index.js

# Event loop delays
clinic bubbleprof -- node dist/index.js

# Opens HTML report in browser
```

**Benefits:**
- 🔥 **Flame graphs:** Visual performance analysis
- 🐛 **Memory leaks:** Detect and fix leaks
- ⏱️ **Bottlenecks:** Find slow operations
- 📊 **Production-ready:** Safe to use in prod

---

## 🎨 Optional But Nice-to-Have

### **Prettier Plugin: Sort Imports**
```bash
pnpm add -D @trivago/prettier-plugin-sort-imports
```

**Configuration:** `.prettierrc`
```json
{
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": [
    "^node:",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

**Result:**
```typescript
// Before
import { createShippingLabel } from './tools/shipping-labels.js';
import { logger } from '@/utils';
import { readFileSync } from 'fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// After (auto-sorted)
import { readFileSync } from 'fs';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { logger } from '@/utils';

import { createShippingLabel } from './tools/shipping-labels.js';
```

---

### **Depcheck - Find Unused Dependencies**
```bash
pnpm add -D depcheck
```

**Add to package.json:**
```json
{
  "scripts": {
    "deps:check": "depcheck"
  }
}
```

**Usage:**
```bash
pnpm deps:check

# Output:
# Unused dependencies:
#   * lodash
# Missing dependencies:
#   * zod (used in src/tools/shipping-labels.ts)
```

---

### **TSX - TypeScript Execute**
```bash
# Already installed!
# pnpm add -D tsx
```

**Benefits:**
- ⚡ **Fast:** No compilation step
- 🔄 **Watch mode:** Auto-reload on changes
- 🎯 **Simple:** Just `tsx file.ts`

**Usage:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "script": "tsx scripts/check-ddp.ts"  // Convert .js to .ts!
  }
}
```

---

## 📊 Tooling Comparison

| Tool | Purpose | Speed | Complexity | ROI |
|------|---------|-------|------------|-----|
| **TSup** | Build | ⚡⚡⚡⚡⚡ | 🟢 Low | 🎯🎯🎯🎯🎯 High |
| **Husky** | Quality | ⚡⚡⚡⚡ | 🟡 Medium | 🎯🎯🎯🎯 High |
| **TypeDoc** | Docs | ⚡⚡⚡ | 🟢 Low | 🎯🎯🎯 Medium |
| **Effect-TS** | Errors | ⚡⚡⚡ | 🔴 High | 🎯🎯🎯🎯 High* |
| **Changesets** | Versions | ⚡⚡⚡⚡ | 🟡 Medium | 🎯🎯🎯 Medium |
| **Clinic.js** | Profile | ⚡⚡ | 🟡 Medium | 🎯🎯🎯 Medium |

*High ROI for complex async workflows

---

## 🚀 Recommended Installation Order

### **Phase 1: Build & Quality (Day 1)**
```bash
pnpm add -D tsup tsconfig-paths
pnpm add -D husky lint-staged
pnpm exec husky init
```

### **Phase 2: Documentation (Day 2)**
```bash
pnpm add -D typedoc
pnpm run docs
```

### **Phase 3: Advanced Features (Week 2)**
```bash
pnpm add effect
pnpm add -D @changesets/cli
pnpm changeset init
```

### **Phase 4: Performance (As Needed)**
```bash
pnpm add -D clinic
clinic doctor -- node dist/index.js
```

---

## 📋 Quick Setup Checklist

### **Immediate (Do Today):**
- [ ] Install tsup: `pnpm add -D tsup`
- [ ] Create `tsup.config.ts`
- [ ] Update build script to use tsup
- [ ] Test: `pnpm run build`

### **This Week:**
- [ ] Install husky + lint-staged
- [ ] Setup pre-commit hooks
- [ ] Install typedoc
- [ ] Generate initial docs: `pnpm docs`

### **This Month:**
- [ ] Evaluate Effect-TS for error handling
- [ ] Setup changesets for versioning
- [ ] Profile with clinic.js
- [ ] Add import sorting

---

## 🎯 Success Metrics

After installing these tools, you should see:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Build time** | ~5s (tsc) | ~0.5s (tsup) | ✅ 10x faster |
| **Pre-commit checks** | None | Auto | ✅ Catch bugs early |
| **Documentation** | Manual | Auto | ✅ Always up-to-date |
| **Error handling** | Try/catch | Type-safe | ✅ Better DX |
| **Version management** | Manual | Auto | ✅ Changelog for free |

---

## 🔗 Resources

### **Documentation:**
- **TSup:** https://tsup.egoist.dev
- **Effect-TS:** https://effect.website
- **TypeDoc:** https://typedoc.org
- **Husky:** https://typicode.github.io/husky
- **Changesets:** https://github.com/changesets/changesets
- **Clinic.js:** https://clinicjs.org

### **Examples:**
- **TSup Config Examples:** https://github.com/egoist/tsup/tree/main/examples
- **Effect-TS Examples:** https://github.com/Effect-TS/effect/tree/main/packages/effect/examples
- **TypeDoc Examples:** https://typedoc.org/example

---

**Next Step:** Start with Phase 1 and install tsup + husky for immediate improvements! 🚀

