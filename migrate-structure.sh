#!/bin/bash

# 🏗️ EasyPost MCP Server - Structure Migration Script
# This script reorganizes the flat structure into a nested, organized structure

set -e  # Exit on error

echo "🏗️  Starting structure migration..."
echo ""

# Confirm with user
read -p "⚠️  This will reorganize your project structure. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="../easypost-mcp-server-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Phase 1: Create new directory structure
echo "📁 Phase 1: Creating directory structure..."
mkdir -p src/{config,tools,services,types,utils}
mkdir -p tests/{unit,integration}
mkdir -p docs/{api,guides,architecture}
mkdir -p scripts
echo "✅ Directories created"
echo ""

# Phase 2: Move source files
echo "📝 Phase 2: Moving source files..."

# Config
if [ -f "src-config.ts" ]; then
    mv src-config.ts src/config/index.ts
    echo "  ✓ Moved config"
fi

# Tools
for file in src-tools-*.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/src-tools-//' | sed 's/.ts$//')
        mv "$file" "src/tools/${newname}.ts"
        echo "  ✓ Moved $file → src/tools/${newname}.ts"
    fi
done

# Services
for file in src-services-*.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/src-services-//' | sed 's/.ts$//')
        mv "$file" "src/services/${newname}.ts"
        echo "  ✓ Moved $file → src/services/${newname}.ts"
    fi
done

# Types
for file in src-types-*.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/src-types-//' | sed 's/.ts$//')
        mv "$file" "src/types/${newname}.ts"
        echo "  ✓ Moved $file → src/types/${newname}.ts"
    fi
done

# Utils
for file in src-utils-*.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/src-utils-//' | sed 's/.ts$//')
        mv "$file" "src/utils/${newname}.ts"
        echo "  ✓ Moved $file → src/utils/${newname}.ts"
    fi
done

# Main index
if [ -f "src-index.ts" ]; then
    mv src-index.ts src/index.ts
    echo "  ✓ Moved src-index.ts → src/index.ts"
fi

echo "✅ Source files moved"
echo ""

# Phase 3: Move test files
echo "🧪 Phase 3: Moving test files..."
for file in tests-unit-*.test.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/tests-unit-//')
        mv "$file" "tests/unit/${newname}"
        echo "  ✓ Moved $file → tests/unit/${newname}"
    fi
done

for file in tests-integration-*.test.ts; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/tests-integration-//')
        mv "$file" "tests/integration/${newname}"
        echo "  ✓ Moved $file → tests/integration/${newname}"
    fi
done
echo "✅ Test files moved"
echo ""

# Phase 4: Move documentation
echo "📚 Phase 4: Moving documentation..."
[ -f "GETTING_STARTED.md" ] && mv GETTING_STARTED.md docs/guides/ && echo "  ✓ Moved GETTING_STARTED.md"
[ -f "MCP_CONFIGURATION.md" ] && mv MCP_CONFIGURATION.md docs/guides/ && echo "  ✓ Moved MCP_CONFIGURATION.md"
[ -f "MCP_SERVERS_GUIDE.md" ] && mv MCP_SERVERS_GUIDE.md docs/guides/ && echo "  ✓ Moved MCP_SERVERS_GUIDE.md"
[ -f "COMPLETE_MCP_SETUP.md" ] && mv COMPLETE_MCP_SETUP.md docs/guides/ && echo "  ✓ Moved COMPLETE_MCP_SETUP.md"
[ -f "PRODUCTION_SETUP.md" ] && mv PRODUCTION_SETUP.md docs/guides/ && echo "  ✓ Moved PRODUCTION_SETUP.md"
[ -f "PROJECT_SPEC.md" ] && mv PROJECT_SPEC.md docs/architecture/ && echo "  ✓ Moved PROJECT_SPEC.md"
[ -f "DYNAMIC_ADDRESSING.md" ] && mv DYNAMIC_ADDRESSING.md docs/architecture/ && echo "  ✓ Moved DYNAMIC_ADDRESSING.md"
[ -f "READY_TO_USE.md" ] && mv READY_TO_USE.md docs/ && echo "  ✓ Moved READY_TO_USE.md"
[ -f "SHIPPING_RATES_SUMMARY.md" ] && mv SHIPPING_RATES_SUMMARY.md docs/ && echo "  ✓ Moved SHIPPING_RATES_SUMMARY.md"
[ -f "YOUR_SHIPMENTS_PREVIEW.md" ] && mv YOUR_SHIPMENTS_PREVIEW.md docs/ && echo "  ✓ Moved YOUR_SHIPMENTS_PREVIEW.md"
[ -f "llm_memory_research.md" ] && mv llm_memory_research.md docs/architecture/ && echo "  ✓ Moved llm_memory_research.md"
echo "✅ Documentation moved"
echo ""

# Phase 5: Move scripts
echo "🔧 Phase 5: Moving scripts..."
[ -f "check-ddp.js" ] && mv check-ddp.js scripts/ && echo "  ✓ Moved check-ddp.js"
[ -f "test-full-address.js" ] && mv test-full-address.js scripts/ && echo "  ✓ Moved test-full-address.js"
echo "✅ Scripts moved"
echo ""

# Phase 6: Create barrel exports
echo "📦 Phase 6: Creating barrel exports..."

# Tools barrel
cat > src/tools/index.ts << 'EOF'
// Barrel export for tools
export * from './shipping-labels.js';
export * from './address-validation.js';
export * from './customs-calculator.js';
export * from './weight-converter.js';
export * from './carrier-selector.js';
export * from './rate-fetcher.js';
EOF
echo "  ✓ Created src/tools/index.ts"

# Services barrel
cat > src/services/index.ts << 'EOF'
// Barrel export for services
export * from './easypost-client.js';
export * from './context7-client.js';
EOF
echo "  ✓ Created src/services/index.ts"

# Types barrel
cat > src/types/index.ts << 'EOF'
// Barrel export for types
export * from './shipping.js';
export * from './customs.js';
EOF
echo "  ✓ Created src/types/index.ts"

# Utils barrel
cat > src/utils/index.ts << 'EOF'
// Barrel export for utilities
export * from './validation.js';
export * from './error-handler.js';
export * from './formatting.js';
EOF
echo "  ✓ Created src/utils/index.ts"

echo "✅ Barrel exports created"
echo ""

# Phase 7: Update imports in main index
echo "🔄 Phase 7: Updating imports in src/index.ts..."
if [ -f "src/index.ts" ]; then
    # Create a temp file with updated imports
    sed -e 's|from '\''./src-tools-|from '\''./tools/|g' \
        -e 's|from '\''./src-services-|from '\''./services/|g' \
        -e 's|from '\''./src-types-|from '\''./types/|g' \
        -e 's|from '\''./src-utils-|from '\''./utils/|g' \
        -e 's|from '\''./src-config|from '\''./config|g' \
        src/index.ts > src/index.ts.tmp
    mv src/index.ts.tmp src/index.ts
    echo "✅ Updated imports in src/index.ts"
fi
echo ""

# Phase 8: Update .mcp.json
echo "⚙️  Phase 8: Updating .mcp.json..."
if [ -f ".mcp.json" ]; then
    sed -i.bak 's|dist/src-index.js|dist/index.js|g' .mcp.json
    rm .mcp.json.bak
    echo "✅ Updated .mcp.json"
fi
echo ""

# Phase 9: Update tsconfig.json
echo "⚙️  Phase 9: Updating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "skipLibCheck": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@/tools/*": ["src/tools/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/config": ["src/config"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
echo "✅ Updated tsconfig.json"
echo ""

# Phase 10: Update package.json scripts
echo "⚙️  Phase 10: Updating package.json scripts..."
node << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = {
  ...pkg.scripts,
  "start": "node dist/index.js",
  "dev": "tsx watch src/index.ts",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration"
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF
echo "✅ Updated package.json"
echo ""

echo "🎉 Migration complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test build: pnpm run build"
echo "  3. Run tests: pnpm test"
echo "  4. If everything works, commit changes"
echo "  5. If issues arise, restore from: $BACKUP_DIR"
echo ""
echo "💡 Tip: Read STRUCTURE_RECOMMENDATIONS.md for additional improvements"

