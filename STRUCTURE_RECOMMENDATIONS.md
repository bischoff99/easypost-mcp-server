# 🏗️ Project Structure Recommendations

**Based on:** Industry best practices, TypeScript patterns, and MCP server architecture  
**Research Date:** October 17, 2025  
**Sources:** Web research + Context7 documentation analysis

---

## 📊 Current vs Recommended Structure

### **Current Structure (Flat):**
```
easypost-mcp-server/
├── src-index.ts                      # 15 files at root
├── src-tools-*.ts                    # All prefixed with category
├── src-services-*.ts
├── src-types-*.ts
├── src-utils-*.ts
├── tests-*.test.ts
├── *.md (10 docs)
└── config files
```

### **Recommended Structure (Nested + Clean):**
```
easypost-mcp-server/
├── src/
│   ├── index.ts                      # Main entry point
│   ├── config/
│   │   └── index.ts                  # Environment & settings
│   ├── tools/
│   │   ├── index.ts                  # Barrel export
│   │   ├── shipping-labels.ts
│   │   ├── address-validation.ts
│   │   ├── customs-calculator.ts
│   │   ├── weight-converter.ts
│   │   ├── carrier-selector.ts
│   │   └── rate-fetcher.ts
│   ├── services/
│   │   ├── index.ts                  # Barrel export
│   │   ├── easypost-client.ts
│   │   └── context7-client.ts
│   ├── types/
│   │   ├── index.ts                  # Barrel export
│   │   ├── shipping.ts
│   │   └── customs.ts
│   └── utils/
│       ├── index.ts                  # Barrel export
│       ├── validation.ts
│       ├── error-handler.ts
│       └── formatting.ts
├── tests/
│   ├── unit/
│   │   └── weight-converter.test.ts
│   └── integration/
│       └── shipping-labels.test.ts
├── scripts/
│   ├── check-ddp.js
│   └── test-full-address.js
├── docs/
│   ├── README.md
│   ├── api/
│   │   ├── tools.md
│   │   └── types.md
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── mcp-setup.md
│   │   └── production.md
│   └── architecture/
│       ├── project-spec.md
│       └── dynamic-addressing.md
├── .mcp.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🎯 Key Improvements

### **1. Source Directory (src/)**
**Benefits:**
- ✅ Separates source from config/docs
- ✅ Standard convention recognized by all tools
- ✅ Easier to exclude from builds/deployments
- ✅ Cleaner root directory

### **2. Barrel Exports (index.ts)**
**Pattern:**
```typescript
// src/tools/index.ts
export * from './shipping-labels.js';
export * from './address-validation.js';
export * from './customs-calculator.js';
// ... etc

// Usage:
import { createShippingLabel, validateAddress } from './tools/index.js';
```

**Benefits:**
- ✅ Single import statement for related modules
- ✅ Hides internal file organization
- ✅ Easier refactoring (move files without breaking imports)

### **3. TypeScript Path Aliases**
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/tools/*": ["src/tools/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/config": ["src/config"]
    }
  }
}
```

**Usage:**
```typescript
// Instead of:
import { EasyPostClient } from '../../../services/easypost-client.js';

// Use:
import { EasyPostClient } from '@/services/easypost-client.js';
```

### **4. Test Organization**
**Current:** `tests-unit-*.test.ts` at root  
**Recommended:** `tests/unit/` and `tests/integration/`

**Benefits:**
- ✅ Clear separation of test types
- ✅ Easier to run specific test suites
- ✅ Better organization for fixtures/mocks

### **5. Documentation Organization**
**Current:** 10 `.md` files at root  
**Recommended:** `docs/` with subcategories

**Structure:**
```
docs/
├── README.md              # Overview
├── api/                   # API documentation
├── guides/                # How-to guides
└── architecture/          # Technical specs
```

---

## 📚 Recommended Additional Libraries

### **Development Tools:**

#### **1. TSConfig Paths Plugin**
```bash
pnpm add -D tsconfig-paths
```
**Purpose:** Enable path aliases at runtime
**Usage:** Add to `package.json` scripts

#### **2. TSup (Modern Bundler)**
```bash
pnpm add -D tsup
```
**Purpose:** Fast TypeScript bundler with zero config
**Benefits:**
- ⚡ 10-100x faster than tsc
- 📦 Automatic code splitting
- 🎯 Minification & tree-shaking
- 🔧 Watch mode

**Config:** `tsup.config.ts`
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false, // Enable for production
});
```

#### **3. Husky + Lint-Staged**
```bash
pnpm add -D husky lint-staged
```
**Purpose:** Pre-commit hooks for quality checks
**Benefits:**
- 🔒 Enforce code quality before commits
- ⚡ Only lint changed files
- 🎯 Prevent bad code from entering repo

**Setup:**
```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ]
  }
}
```

#### **4. Changesets**
```bash
pnpm add -D @changesets/cli
```
**Purpose:** Version management and changelog generation
**Benefits:**
- 📝 Automatic changelog generation
- 🏷️ Semantic versioning
- 📦 Multi-package support

### **Runtime Enhancements:**

#### **5. Zod-to-TS (Schema to Types)**
```bash
pnpm add -D zod-to-ts
```
**Purpose:** Generate TypeScript types from Zod schemas
**Benefits:**
- 🔄 Single source of truth
- ✅ Runtime + compile-time validation
- 📚 Auto-generated type docs

#### **6. Effect-TS (Advanced Error Handling)**
```bash
pnpm add effect
```
**Purpose:** Functional error handling & async workflows
**Benefits:**
- 🎯 Type-safe error handling
- 🔄 Better than promises for complex flows
- 🧪 Easier testing with dependency injection

#### **7. Fastify (Alternative to stdio transport)**
```bash
pnpm add fastify
```
**Purpose:** High-performance HTTP server
**Benefits:**
- ⚡ 2x faster than Express
- 📊 Built-in schema validation
- 🔌 Plugin architecture

---

## 🔧 Migration Plan

### **Phase 1: Directory Restructure (30 min)**
```bash
# 1. Create directories
mkdir -p src/{config,tools,services,types,utils}
mkdir -p tests/{unit,integration}
mkdir -p docs/{api,guides,architecture}
mkdir -p scripts

# 2. Move source files
mv src-config.ts src/config/index.ts
mv src-tools-*.ts src/tools/
mv src-services-*.ts src/services/
mv src-types-*.ts src/types/
mv src-utils-*.ts src/utils/
mv src-index.ts src/index.ts

# 3. Move test files
mv tests-unit-*.test.ts tests/unit/
mv tests-integration-*.test.ts tests/integration/

# 4. Move documentation
mv GETTING_STARTED.md docs/guides/
mv MCP_*.md docs/guides/
mv PROJECT_SPEC.md docs/architecture/
# ... etc

# 5. Move scripts
mv check-ddp.js scripts/
mv test-full-address.js scripts/
```

### **Phase 2: Update Imports (15 min)**
Use search & replace to update import paths:
```typescript
// Old:
import { x } from './src-tools-shipping-labels.js';

// New:
import { x } from './tools/shipping-labels.js';
```

### **Phase 3: Add Barrel Exports (10 min)**
Create `index.ts` in each directory:
```typescript
// src/tools/index.ts
export * from './shipping-labels.js';
export * from './address-validation.js';
// ... etc
```

### **Phase 4: Update tsconfig.json (5 min)**
Add path aliases and update paths

### **Phase 5: Update package.json (5 min)**
Update build/test paths

### **Phase 6: Test & Rebuild (10 min)**
```bash
pnpm run type-check
pnpm run build
pnpm test
```

**Total Time: ~75 minutes**

---

## 🎨 Code Quality Enhancements

### **1. Add Type-only Imports**
```typescript
// Instead of:
import { Address, Package } from './types/shipping.js';

// Use:
import type { Address, Package } from './types/shipping.js';
```
**Benefits:** Faster compilation, smaller bundles

### **2. Implement Dependency Injection**
```typescript
// Instead of:
export async function createShippingLabel(args: any) {
  const client = new EasyPostClient(); // Hard-coded dependency
  // ...
}

// Use:
export async function createShippingLabel(
  args: any,
  client: IShippingClient = new EasyPostClient()
) {
  // Now testable with mock clients
}
```

### **3. Add Input Validation Layer**
```typescript
// src/tools/shipping-labels.ts
import { z } from 'zod';

const ShippingLabelInput = z.object({
  inputData: z.string(),
  shipFromOverride: z.string().optional(),
  serviceLevel: z.enum(['ground', 'express', 'priority']).optional(),
  insuranceAmount: z.number().positive().optional()
});

export async function createShippingLabel(args: unknown) {
  const validated = ShippingLabelInput.parse(args); // Throws if invalid
  // ... rest of logic
}
```

---

## 📦 Additional Tooling Recommendations

### **Monorepo (Future Growth):**
If you plan to add more MCP servers:

**Option A: Turborepo**
```bash
pnpm add -D turbo
```
**Pros:**
- ⚡ Incremental builds
- 🔄 Task caching
- 📊 Parallel execution

**Option B: Nx**
```bash
pnpm add -D nx
```
**Pros:**
- 🎯 Dependency graph visualization
- 🔧 Advanced code generation
- 📈 Build analytics

### **API Documentation:**

**TypeDoc**
```bash
pnpm add -D typedoc
```
**Purpose:** Generate API docs from TypeScript comments
**Output:** HTML documentation website

### **Performance Monitoring:**

**Clinic.js**
```bash
pnpm add -D clinic
```
**Purpose:** Node.js performance profiling
**Features:**
- 🔥 Flame graphs
- 📊 Memory leaks
- ⏱️ Event loop delays

---

## 🚀 Recommended package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "build:tsc": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:unit": "vitest tests/unit",
    "test:integration": "vitest tests/integration",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write 'src/**/*.ts' 'tests/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts' 'tests/**/*.ts'",
    "type-check": "tsc --noEmit",
    "quality": "pnpm run lint && pnpm run format:check && pnpm run type-check && pnpm test",
    "docs": "typedoc src/index.ts",
    "clean": "rm -rf dist coverage .turbo",
    "prepare": "husky install"
  }
}
```

---

## 📋 Summary Checklist

### **Quick Wins (Do First):**
- [ ] Move source files to `src/` directory
- [ ] Move tests to `tests/` directory
- [ ] Move docs to `docs/` directory
- [ ] Add barrel exports (`index.ts` files)
- [ ] Update TypeScript path aliases

### **Medium Priority:**
- [ ] Install tsup for faster builds
- [ ] Add husky + lint-staged
- [ ] Implement dependency injection
- [ ] Add type-only imports
- [ ] Generate API documentation

### **Nice to Have:**
- [ ] Add Effect-TS for better error handling
- [ ] Set up changesets for versioning
- [ ] Add performance monitoring
- [ ] Consider monorepo if expanding

---

## 🎓 Using Context7 for Future Research

To properly use Context7 for documentation research:

```bash
# 1. Restart Cursor to load MCP servers
# 2. In chat, ask:
"Use resolve-library-id to find 'typescript project structure' documentation"
"Use get-library-docs to get docs for '/vercel/turborepo'"
```

**Or programmatically:**
```typescript
// In your code
const context7 = await mcp.callTool('resolve-library-id', {
  libraryName: 'typescript'
});

const docs = await mcp.callTool('get-library-docs', {
  context7CompatibleLibraryID: '/microsoft/TypeScript',
  topic: 'project structure',
  tokens: 5000
});
```

---

## 🔗 References

- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **TypeScript Deep Dive:** https://basarat.gitbook.io/typescript/
- **MCP SDK Documentation:** https://github.com/modelcontextprotocol/sdk
- **Clean Architecture:** https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

---

**Next Steps:** Start with Phase 1 of the migration plan and work through systematically. Each phase is reversible, so you can test as you go! 🚀

