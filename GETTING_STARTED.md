# Getting Started with EasyPost MCP Server

## Quick Start Guide

Welcome to your EasyPost MCP Server project! This guide will help you get up and running quickly.

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- pnpm 8.0.0 or higher (or npm/yarn)
- EasyPost API account (get your key at https://www.easypost.com/account/api-keys)
- Context7 API key (optional, for enhanced address validation)

## 🚀 Installation

1. **Install dependencies:**

```bash
pnpm install
# or
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` file and add your API keys:

```env
EASYPOST_API_KEY=your_actual_easypost_key_here
CONTEXT7_API_KEY=your_context7_key_here  # Optional
```

## 🏗️ Build the Project

```bash
# Build TypeScript to JavaScript
pnpm run build

# Or run in development mode with auto-reload
pnpm run dev
```

## 🧪 Run Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm run test:unit

# Run integration tests
pnpm run test:integration

# Watch mode for development
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

## 📦 Project Structure

```
easypost-mcp-server/
├── src-index.ts                          # Main MCP server entry point
├── src-tools-shipping-labels.ts          # Core shipping label generation
├── src-tools-address-validation.ts       # Address verification
├── src-tools-customs-calculator.ts       # Customs declarations
├── src-tools-weight-converter.ts         # Weight conversion & buffering
├── src-tools-carrier-selector.ts         # Carrier/service selection
├── src-services-easypost-client.ts       # EasyPost API integration
├── src-services-context7-client.ts       # Context7 MCP integration
├── src-types-shipping.ts                 # TypeScript interfaces
├── src-types-customs.ts                  # Customs declaration types
├── src-utils-validation.ts               # Input validation utilities
├── src-utils-formatting.ts               # Output formatting helpers
├── src-utils-error-handler.ts            # Error handling & circuit breaker
├── tests-integration-shipping-labels.test.ts  # Integration tests
├── tests-unit-weight-converter.test.ts   # Unit tests
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── .mcp.json                             # MCP server configuration
├── .env.example                          # Environment variables template
└── README.md                             # Full documentation
```

## 🔧 Usage Examples

### Create a Shipping Label (Domestic)

```typescript
// Example input for domestic shipping
const inputData = {
  to: {
    name: "John Doe",
    street1: "123 Main St",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "US",
    phone: "555-1234",
    email: "john@example.com"
  },
  weight: 5,
  dimensions: { length: 12, width: 10, height: 6 }
};
```

### Create International Shipping Label with Customs

```typescript
// Example input for international shipping
const inputData = {
  to: {
    name: "Hans Schmidt",
    street1: "Schillerstrasse 20",
    city: "Asperg",
    zip: "71679",
    country: "DE",
    phone: "+4915124319939"
  },
  weight: 15,
  dimensions: { length: 27, width: 15, height: 10 },
  products: [
    {
      description: "Premium Blue Denim Jeans",
      quantity: 2,
      value: 50,
      weightLbs: 1.5,
      htsCode: "6204.62.4040"
    }
  ],
  restrictionFlag: true
};
```

## 🎯 Key Features

### 1. **Smart Ship-From Selection**
- California destinations → Los Angeles warehouse
- Nevada destinations → Las Vegas warehouse
- Default → Los Angeles warehouse

### 2. **Automatic Weight Buffering**
- Converts pounds to ounces
- Applies 10-20% packaging buffer
- Tracks full vs. reported weight

### 3. **Customs Automation**
- Auto-generates HTS codes
- Creates CN22/CN23 forms
- Country-specific compliance notes
- Auto-injects sample products if none provided

### 4. **Robust Error Handling**
- Circuit breaker pattern
- Exponential backoff retry
- Graceful fallback mode

## 🔍 Code Quality

```bash
# Lint your code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format code with Prettier
pnpm run format

# Type check
pnpm run type-check

# Run all quality checks
pnpm run quality:check
```

## 📚 Next Steps

1. Review the full `README.md` for detailed documentation
2. Check `PROJECT_SPEC.md` for the complete project specification
3. Explore the test files to understand usage patterns
4. Customize ship-from addresses in `src-utils-validation.ts`
5. Add more carrier options in `src-tools-carrier-selector.ts`

## 🆘 Troubleshooting

### Issue: API Key errors
**Solution:** Make sure your `.env` file has valid API keys

### Issue: TypeScript errors
**Solution:** Run `pnpm run type-check` to see specific errors

### Issue: Module not found errors
**Solution:** Run `pnpm install` to ensure all dependencies are installed

### Issue: Tests failing
**Solution:** Tests may fail without valid API credentials. Use test mode or mock services.

## 📖 Additional Resources

- [EasyPost API Documentation](https://www.easypost.com/docs/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

This is a starting point for your project. Feel free to:
- Add more features
- Improve error handling
- Enhance test coverage
- Add more carrier integrations
- Customize for your specific needs

Happy shipping! 🚚📦

