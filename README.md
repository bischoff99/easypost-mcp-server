# EasyPost MCP Server

Complete EasyPost MCP server for automated shipping label creation with Model Context Protocol (MCP) integration.

## Features

- ✅ **Automated Shipping Labels**: Generate complete shipping labels with one command
- 🌍 **International Support**: Full customs declaration automation
- 📦 **Smart Weight Buffering**: Automatic 10-20% packaging buffer calculation
- 🏭 **Dynamic Ship-From**: Intelligent warehouse selection based on destination
- 🔒 **Address Validation**: Real-time validation via MCP Context7 service
- 🧮 **HTS Code Lookup**: Automatic customs classification
- 🔄 **Circuit Breaker**: Fault-tolerant with automatic fallbacks
- 📊 **Comprehensive Testing**: Full unit and integration test coverage

## Installation

```bash
# Clone repository
git clone <repository-url>
cd easypost-mcp-server

# Install dependencies
npm install
# or if using pnpm (recommended)
pnpm install

# Copy environment template
cp .env.example .env

# Configure your API keys in .env
```

## Configuration

Create a `.env` file with your API keys:

```env
EASYPOST_API_KEY=your_easypost_key_here
CONTEXT7_API_KEY=your_context7_key_here
```

## Usage

### EasyPost MCP Server

```bash
pnpm run build  # Build with tsup (fast)
pnpm start      # Start MCP server
pnpm dev        # Development mode
```

### Knowledge Pipeline (NEW!)

```bash
# Start services
pnpm chroma:start  # Chroma DB
pnpm redis:start   # Redis cache (already running)

# Basic pipeline
pnpm knowledge:query "your question"

# Production pipeline (LangChain + Redis + FREE Reranker)
pnpm prod:ingest [url]
pnpm prod:query "question"

# Automated multi-source ingestion
pnpm auto:github          # GitHub docs
pnpm auto:stackoverflow   # Stack Overflow
pnpm auto:api-docs        # API documentation
```

### Testing

```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
```

## MCP Tools

### create_shipping_label

Generate a complete automated shipping label.

**Parameters:**
- `inputData` (string, required): Shipping data in JSON, CSV, or text format
- `shipFromOverride` (string, optional): Override default ship-from address
- `serviceLevel` (enum, optional): 'ground' | 'express' | 'priority'
- `insuranceAmount` (number, optional): Insurance coverage amount

**Example:**

```json
{
  "inputData": {
    "to": {
      "name": "John Doe",
      "street1": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "country": "US"
    },
    "weight": 5,
    "dimensions": { "length": 12, "width": 10, "height": 6 }
  },
  "serviceLevel": "ground"
}
```

### validate_address

Validate and verify shipping addresses.

### calculate_customs

Generate customs declarations with HTS codes.

## Architecture

### Flat File Structure

All source files use flat structure with hyphenated names:
- `src-index.ts` - Main server entry
- `src-tools-*.ts` - Tool implementations
- `src-services-*.ts` - Service clients
- `src-types-*.ts` - TypeScript types
- `src-utils-*.ts` - Utility functions
- `tests-*.test.ts` - Test files

### Key Components

1. **MCP Server** (`src-index.ts`): Main server with tool registration
2. **Shipping Tools** (`src-tools-*.ts`): Core business logic
3. **EasyPost Service** (`src-services-easypost-client.ts`): API integration
4. **Context7 Client** (`src-services-context7-client.ts`): MCP validation service
5. **Error Handler** (`src-utils-error-handler.ts`): Circuit breaker and retry logic

## Features in Detail

### Smart Ship-From Selection

- **California destinations** → Los Angeles warehouse
- **Nevada destinations** → Las Vegas warehouse
- **Default** → Los Angeles warehouse
- **Override** → Manual specification supported

### Weight Buffering

Automatic packaging buffer calculation:
- Converts pounds to ounces (1 lb = 16 oz)
- Applies 10-20% buffer for packaging materials
- Minimum buffer: 0.5 oz or 5% of weight
- Separate tracking of full vs reported weight

### Customs Automation

For international shipments:
- Auto-generates HTS codes via Context7 API
- Creates CN22/CN23 forms automatically
- Injects sample products if none provided
- Country-specific compliance notes

### Error Handling

- Circuit breaker pattern (5 failure threshold, 60s timeout)
- Exponential backoff retry (2s, 4s, 8s)
- Correlation IDs for request tracking
- Structured logging with Pino
- Graceful degradation with fallbacks

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run all quality checks
npm run quality:check
```

### Dependencies

**Production:**
- `@modelcontextprotocol/sdk` - MCP server framework
- `@easypost/api` - EasyPost shipping API
- `zod` - Schema validation
- `pino` - Structured logging
- `undici` - HTTP client
- `uuid` - Correlation IDs

**Development:**
- `typescript` - Type safety
- `vitest` - Testing framework
- `tsx` - TypeScript execution
- `eslint` - Code linting
- `prettier` - Code formatting

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

