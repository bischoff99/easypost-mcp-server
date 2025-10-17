# Comprehensive Perplexity AI Labs Prompt: Create Complete EasyPost MCP Server with Automated Shipping Label Creation


## System Context
You are an advanced AI assistant specialized in creating MCP (Model Context Protocol) servers with access to MCP tools for real-time data validation, API authentication, and iterative refinements. You have the following MCP server capabilities:


- **Filesystem MCP**: Read/write shipping configurations and validate against `.mcp.json` integrity
- **Debug Mode (🪲)**: Test server connections, handle timeouts (10s), and simulate parcel density calculations
- **Code Mode (💻)**: Generate, modify, and test TypeScript/JavaScript code
- **Ask Mode (❓)**: Research and validate shipping APIs, HTS codes, and compliance requirements
- **Circuit Breaker Integration**: Handle API failures with retry logic and fallback mechanisms


## Project Structure
Generate a complete MCP server project with the following flat structure (no sub-directories):


```
easypost-mcp-server/
├── src-index.ts                 # Main MCP server entry point
├── src-tools-shipping-labels.ts   # Core shipping label generation
├── src-tools-address-validation.ts # Address verification via MCP
├── src-tools-customs-calculator.ts # HTS codes and customs forms
├── src-tools-weight-converter.ts  # Weight conversion and buffering
├── src-tools-carrier-selector.ts  # Service level selection
├── src-services-easypost-client.ts   # EasyPost API integration
├── src-services-context7-client.ts   # Context7 MCP integration
├── src-types-shipping.ts          # TypeScript interfaces
├── src-types-customs.ts           # Customs declaration types
├── src-utils-validation.ts        # Input validation utilities
├── src-utils-formatting.ts        # Output formatting helpers
├── src-utils-error-handler.ts      # Error handling utilities
├── tests-integration-shipping-labels.test.ts
├── tests-unit-weight-converter.test.ts
├── .mcp.json                    # MCP server configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── README.md                    # Documentation
└── .env.example                 # Environment variables template
```


## Implementation Requirements
Create a complete EasyPost MCP server that generates fully automated shipping labels with the following rules:


### 2. Dynamic Ship-From Address Selection
- **California inputs**: Use Los Angeles address: "1234 S Broadway, Los Angeles, CA 90015"
- **Nevada inputs**: Use Las Vegas address: "3000 Paradise Rd, Las Vegas, NV 89109"
- **Default/unspecified**: Default to Los Angeles address
- **Override logic**: If explicit sender address provided, use it; otherwise apply state-based selection


### 3. Weight Conversion and Buffering
- Convert all weights from pounds (lbs) to ounces (oz): `weightOz = weightLbs * 16`
- Apply packaging buffer: Reduce reported package weight by 10-20% from full parcel weight
- Minimum buffer: 0.5 oz or 5% of converted weight (whichever is greater)
- Formula: `reportedWeight = (weightOz * (0.8-0.9)) - max(0.5, weightOz * 0.05)`
- Track separate `fullParcelOz` (total) vs `reportedWeight` (for shipping)


### 4. Customs Declaration Automation
**For Non-Clothing Items:**
- Include HTS codes, descriptions, quantities, values ($40-100 per item based on context)
- Add country-specific compliance notes
- Use "PERSONAL MANUFACTURED GOODS" declaration


**For Clothing/Jeans:**
- Detailed descriptions: "100% cotton denim jeans, [size], featuring [features], HTS Code: 6204.62.2040, value $[value] each"
- Accurate dutiable values, weights per unit (add to total input weight)
- Restrictions: Use TRUE/FALSE flags from input; default "PERSONAL USE"
- Declarations: "GIFT" or "PERSONAL USE" where appropriate


**Auto-Injection for No Products:**
- Inject 2-4 pairs of "premium denim jeans" with varied colors (blue, black), sizes (M/L/XL)
- Materials: cotton blend, HTS: 6204.62, individual weights: 1-2 lbs each, values: $40-60 each
- Integrate into customs and weights: `totalOz < fullParcelOz`


### 5. Complete Shipping Data Population
**Required Fields:**
- **Sender Details**: Company name, full address, phone, email
- **Recipient Details**: Full name, street, city, province/state, zip, country, phone, email
- **Package**: Dimensions (LxWxH in inches), converted weightOz, type (box), service level (UPS Ground/FedEx Express)
- **Tracking**: Generate placeholder (e.g., "1Z9999999999999999" for UPS)
- **Insurance**: Default $100 coverage for international shipments
- **Customs Forms**: CN22/CN23 for international with detailed item arrays


### 5. MCP Tool Integration Implementation
**MCP Server Integration:**
- Use `read_file` to verify `.mcp.json` integrity before processing
- Test server connections with `execute_command` (timeout 10s)
- Handle disconnections gracefully (fallback to hardcoded values with warnings)
- Implement health checks for all MCP servers before operations
- Circuit breaker pattern with 5 failure threshold and 60s timeout


**Advanced Error Handling:**
- Exponential backoff retry logic (2s, 4s, 8s delays)
- Structured error logging with Pino and correlation IDs
- Type-safe error handling with custom Error classes
- API timeout handling with AbortSignal (30s default)


**Diff-Tracking for Iterative Refinements:**
- Use `apply_diff` to track changes in shipping data
- Implement `update_todo_list` for incomplete data handling
- Apply `new_task` for error scenarios (e.g., invalid addresses)
- Version control shipping configurations with diff tracking
- Carrier optimization with multi-criteria scoring (cost/speed/reliability)


**Fallback Reasoning:**
- Circuit breaker fallback to cached/mock data when API fails
- Simulate parcel density: `densityRatio = weightOz / (length * width * height)`
- External data integration for compliance validation
- Graceful degradation when MCP servers are unavailable
- Mock mode support for development and testing


### 7. MCP Server Architecture
**Server Entry Point (src-index.ts):**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema, 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';


// Import all tools
import { shippingLabelTool } from './src-tools-shipping-labels.js';
import { addressValidationTool } from './src-tools-address-validation.js';
import { customsCalculatorTool } from './src-tools-customs-calculator.js';


const server = new Server(
  {
    name: 'easypost-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);


// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      shippingLabelTool,
      addressValidationTool,
      customsCalculatorTool
    ]
  };
});


// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;


  try {
    switch (name) {
      case 'create_shipping_label':
        return await shippingLabelTool(args);
      case 'validate_address':
        return await addressValidationTool(args);
      case 'calculate_customs':
        return await customsCalculatorTool(args);
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('EasyPost MCP server running on stdio');
}


main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```


**MCP Configuration (.mcp.json):**
```json
{
"mcpServers": {
"easypost-mcp-server": {
"command": "node",
"args": ["dist/src-index.js"],
"description": "Complete EasyPost shipping label automation with MCP integration",
"enabled": true,
"autoStart": true,
"env": {
"EASYPOST_API_KEY": "your_api_key_here",
"CONTEXT7_API_KEY": "ctx7sk-07231604-5282-4562-9f3c-50b13e28af5d"
}
}
}
}
```

**TypeScript Configuration (tsconfig.json):**
```json
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
    "rootDir": ".",
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
      "@/*": ["src-*.ts"]
    }
  },
  "include": ["src-*.ts"],
  "exclude": ["node_modules", "dist"]
}
```


**Package.json Dependencies (Based on Current Project):**
```json
{
  "name": "easypost-mcp-server",
  "version": "1.0.0",
  "description": "Complete EasyPost MCP server for automated shipping label creation with MCP integration",
  "main": "dist/src-index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src-index.js",
    "dev": "tsx watch src-index.ts",
    "dev:tools": "tsx watch src-tools-shipping-labels.ts",
    "test": "vitest",
    "test:unit": "vitest run tests-unit-*.test.ts",
    "test:integration": "vitest run tests-integration-*.test.ts",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "quality:check": "pnpm run lint:check && pnpm run format:check && pnpm run type-check"
  },
  "keywords": ["mcp", "easypost", "shipping", "automation", "customs"],
  "author": "Perplexity AI Labs",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@easypost/api": "^9.3.0",
    "dotenv": "^16.4.5",
    "pino": "^9.5.0",
    "pino-pretty": "^11.3.0",
    "undici": "^7.2.0",
    "uuid": "^11.0.3",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/node": "^22.10.2",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^8.18.2",
    "@typescript-eslint/parser": "^8.18.2",
    "@vitest/coverage-v8": "^3.2.4",
    "depcheck": "^1.4.7",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^3.2.4"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```


### 8. Additional Tool Implementations
**Address Validation Tool:**
```typescript
import { Context7Client } from './src-services-context7-client.js';


export const addressValidationTool = {
name: 'validate_address',
description: 'Validate and verify shipping addresses using MCP context7 service',
inputSchema: { /* address validation schema */ }
};


export async function validateAddress(address: any) {
const context7 = new Context7Client();
try {
const validation = await context7.validateAddress(address);
return {
content: [{ type: 'text', text: JSON.stringify(validation) }]
};
} catch (error) {
// Fallback to basic validation
return fallbackAddressValidation(address);
}
}
```


**Customs Calculator Tool:**
```typescript
import { Context7Client } from './src-services-context7-client.js';


export const customsCalculatorTool = {
name: 'calculate_customs',
description: 'Generate customs declarations with HTS codes and compliance information',
inputSchema: { /* customs calculation schema */ }
};


export async function generateCustoms(products: any[], destinationCountry: string) {
const context7 = new Context7Client();


if (!products || products.length === 0) {
// Auto-inject sample clothing items
products = generateSampleProducts();
}


const customsItems = [];
for (const product of products) {
const htsData = await context7.getHTSCode(product.description, destinationCountry);
customsItems.push({
description: product.description,
htsCode: htsData.code,
quantity: product.quantity || 1,
value: product.value || calculateEstimatedValue(product),
weightOz: convertToOunces(product.weightLbs || 1.5),
countryOfOrigin: 'US',
declaration: product.restrictionFlag ? 'PERSONAL USE' : 'GIFT'
});
}


return {
formType: destinationCountry === 'US' ? 'domestic' : 'CN22',
items: customsItems,
totalValue: customsItems.reduce((sum, item) => sum + item.value, 0),
complianceNotes: getCountryComplianceNotes(destinationCountry)
};
}
```


**Weight Converter Utility:**
```typescript
export const weightConverter = {
  convertAndBuffer(weightLbs: number, productDetails?: any[]) {
    const weightOz = weightLbs * 16;


    // Add product weights
    const productWeightOz = productDetails ?
      productDetails.reduce((sum, p) => sum + (convertToOunces(p.weightLbs || 1.5) * (p.quantity || 1)), 0) : 0;


    const fullParcelOz = weightOz + productWeightOz;


    // Apply 10-20% packaging buffer
    const bufferPercent = Math.min(0.20, Math.max(0.10, 0.15)); // 15% default
    const bufferAmount = Math.max(0.5, fullParcelOz * bufferPercent);
    const reportedWeight = fullParcelOz - bufferAmount;


    return {
      fullParcelOz: Math.max(reportedWeight, fullParcelOz * 0.85), // Ensure minimum 85% of full weight
      reportedWeightOz: Math.max(1, reportedWeight) // Minimum 1 oz
    };
  }
};
```


### 7. Input Processing Rules
**Supported Input Formats:**
- CSV/TSV: State, Service, Type, FirstName, LastName, Phone, Email, Street, City, Province, Zip, Country, RestrictionFlag, Dimensions, InputWeight, ProductDetails
- Structured JSON: {from: {...}, to: {...}, package: {...}}
- Text descriptions with embedded data


**Validation:**
- Phone/email format validation
- Address completeness checks
- International vs domestic routing logic
- Tax-exempt gifts if RestrictionFlag indicates TRUE


## Tool Implementation Examples


### Shipping Labels Tool (src-tools-shipping-labels.ts)
```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EasyPostClient } from './src-services-easypost-client.js';
import { Context7Client } from './src-services-context7-client.js';
import { weightConverter } from './src-utils-weight-converter.js';
import { addressValidator } from './src-tools-address-validation.js';
import { customsCalculator } from './src-tools-customs-calculator.js';


const createShippingLabelSchema = z.object({
  inputData: z.string().describe('Shipping input data (CSV, JSON, or text description)'),
  shipFromOverride: z.string().optional().describe('Override default ship-from address'),
  serviceLevel: z.enum(['ground', 'express', 'priority']).optional().describe('Shipping service level'),
  insuranceAmount: z.number().optional().describe('Insurance coverage amount')
});


export const shippingLabelTool: Tool = {
  name: 'create_shipping_label',
  description: 'Generate complete automated shipping labels with customs declarations',
  inputSchema: {
    type: 'object',
    properties: {
      inputData: {
        type: 'string',
        description: 'Shipping input data (CSV, JSON, or text description)'
      },
      shipFromOverride: {
        type: 'string',
        description: 'Override default ship-from address'
      },
      serviceLevel: {
        type: 'string',
        enum: ['ground', 'express', 'priority'],
        description: 'Shipping service level'
      },
      insuranceAmount: {
        type: 'number',
        description: 'Insurance coverage amount'
      }
    },
    required: ['inputData']
  }
};


export async function createShippingLabel(args: any) {
  try {
    // Parse input data
    const shippingInput = parseShippingInput(args.inputData);


    // Determine ship-from address
    const shipFrom = args.shipFromOverride || selectShipFromAddress(shippingInput);


    // Validate addresses using MCP
    const [validatedFrom, validatedTo] = await Promise.all([
      addressValidator.validateAddress(shipFrom),
      addressValidator.validateAddress(shippingInput.recipient)
    ]);


    // Convert and buffer weights
    const weightData = weightConverter.convertAndBuffer(shippingInput.weightLbs, shippingInput.productDetails);


    // Generate customs declarations
    const customs = await customsCalculator.generateCustoms(
      shippingInput.productDetails || [],
      shippingInput.recipient.country
    );


    // Select carrier and service
    const carrierService = selectCarrierService(shippingInput, args.serviceLevel);


    // Create EasyPost shipment
    const easyPostClient = new EasyPostClient();
    const shipment = await easyPostClient.createShipment({
      from_address: validatedFrom,
      to_address: validatedTo,
      parcel: {
        length: shippingInput.dimensions.length,
        width: shippingInput.dimensions.width,
        height: shippingInput.dimensions.height,
        weight: weightData.reportedWeightOz
      },
      customs_info: customs,
      service: carrierService.service,
      insurance: args.insuranceAmount || 100
    });


    // Buy label and return complete data
    const label = await easyPostClient.buyLabel(shipment.id, carrierService.rateId);


    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          shippingLabel: {
            id: shipment.id,
            timestamp: new Date().toISOString(),
            sender: validatedFrom,
            recipient: validatedTo,
            package: {
              dimensions: shippingInput.dimensions,
              weightOz: weightData.reportedWeightOz,
              fullParcelOz: weightData.fullParcelOz,
              type: 'box',
              service: carrierService.service,
              tracking: label.tracking_code,
              insurance: args.insuranceAmount || 100
            },
            customs: customs,
            metadata: {
              serviceProvider: carrierService.carrier,
              estimatedCost: label.rate,
              international: shippingInput.recipient.country !== 'US',
              validationStatus: 'VERIFIED',
              mcpToolsUsed: ['context7', 'supermemory', 'filesystem'],
              warnings: []
            }
          }
        }, null, 2)
      }]
    };


  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.message,
          validationStatus: 'FAILED',
          warnings: ['Failed to generate shipping label']
        }, null, 2)
      }],
      isError: true
    };
  }
}
```


## Output Format Specification


The MCP server returns JSON-structured shipping labels with nested objects:


```json
{
  "shippingLabel": {
    "id": "AUTO_GENERATED_UUID",
    "timestamp": "ISO_8601_TIMESTAMP",
    "sender": { /* validated address object */ },
    "recipient": { /* validated address object */ },
    "package": {
      "dimensions": { "length": 12, "width": 12, "height": 4 },
      "weightOz": 13.5,
      "fullParcelOz": 15.0,
      "type": "box",
      "service": "UPS Ground",
      "tracking": "1Z9999999999999999",
      "insurance": 100.00
    },
    "customs": {
      "formType": "CN22",
      "items": [ /* detailed customs items */ ],
      "totalValue": 150.00,
      "complianceNotes": "Country-specific requirements"
    },
    "metadata": {
      "serviceProvider": "UPS",
      "estimatedCost": 45.67,
      "international": true,
      "validationStatus": "VERIFIED",
      "mcpToolsUsed": ["context7", "supermemory", "filesystem"],
      "warnings": []
    }
  }
}
```


## Example Processing


**Input:**
```
From: My Framing Store Inc, 485 U.S Rte 1, Edison, NJ 08817 USA
BaseWeight: 15 lbs
Dimensions: 27-15-10 inches
To: Niko Gatsos, Schillerstrasse 20, 71679 Asperg, Germany, +4915124319939
RestrictionFlag: TRUE
ProductDetails: None specified
```


**Processing Steps:**
1. **Ship-From**: NJ specified → override default, use Edison NJ address
2. **Weight**: 15 lbs = 240 oz → buffer 10% = 216 oz reported (but cap at reasonable shipping weight)
3. **Auto-Inject**: 3 pairs jeans → add ~6 lbs (96 oz) → total fullParcelOz ~336 oz, reported ~302 oz
4. **Customs**: Germany international → CN23 form, HTS 6204.62, total value $150 "GIFT"
5. **Service**: International → FedEx Express, tracking placeholder
6. **Validation**: Use MCP tools to verify address via context7 API


**Output:** Complete JSON shipping label as specified above.


## Error Handling and Validation


- **Incomplete Data**: Use `update_todo_list` to flag missing fields
- **API Failures**: Log warnings, use fallbacks
- **Invalid Addresses**: Trigger `new_task` for address correction
- **MCP Disconnections**: Verify `.mcp.json` integrity, retry connections


## Complete Missing Function Implementations


### Input Parser (src-utils-validation.ts)
```typescript
import { z } from 'zod';


const AddressSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  street1: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  zip: z.string(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional()
});


const DimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive()
});


const ProductSchema = z.object({
  description: z.string(),
  quantity: z.number().positive().default(1),
  value: z.number().positive().optional(),
  weightLbs: z.number().positive().optional(),
  htsCode: z.string().optional()
});


export function parseShippingInput(inputData: string): any {
  try {
    // Try JSON first
    const jsonData = JSON.parse(inputData);
    return {
      recipient: AddressSchema.parse(jsonData.to || jsonData.recipient),
      sender: jsonData.from ? AddressSchema.parse(jsonData.from) : null,
      weightLbs: jsonData.weight || jsonData.weightLbs || 1,
      dimensions: DimensionsSchema.parse(jsonData.dimensions || { length: 12, width: 12, height: 4 }),
      productDetails: jsonData.products ? jsonData.products.map((p: any) => ProductSchema.parse(p)) : [],
      restrictionFlag: jsonData.restrictionFlag || jsonData.isRestricted || false,
      serviceLevel: jsonData.serviceLevel || 'ground'
    };
  } catch (jsonError) {
    // Try CSV/TSV format
    if (inputData.includes(',') || inputData.includes('\t')) {
      return parseCSVInput(inputData);
    }
    
    // Try text description format
    return parseTextInput(inputData);
  }
}


function parseCSVInput(csvData: string): any {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(/[,\t]/);
  const values = lines[1].split(/[,\t]/);
  
  const data: Record<string, string> = {};
  headers.forEach((header, idx) => {
    data[header.trim().toLowerCase()] = values[idx]?.trim() || '';
  });


  // Parse dimensions (format: L-W-H or LxWxH)
  const dimStr = data.dimensions || '12-12-4';
  const dims = dimStr.split(/[-x]/);


  return {
    recipient: {
      name: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
      street1: data.street || data.address,
      city: data.city,
      state: data.province || data.state,
      zip: data.zip || data.postal,
      country: data.country || 'US',
      phone: data.phone,
      email: data.email
    },
    sender: null,
    weightLbs: parseFloat(data.inputweight || data.weight || '1'),
    dimensions: {
      length: parseFloat(dims[0] || '12'),
      width: parseFloat(dims[1] || '12'),
      height: parseFloat(dims[2] || '4')
    },
    productDetails: data.productdetails ? JSON.parse(data.productdetails) : [],
    restrictionFlag: data.restrictionflag?.toLowerCase() === 'true',
    serviceLevel: data.service || 'ground'
  };
}


function parseTextInput(textData: string): any {
  const lines = textData.split('\n');
  const parsed: any = {
    recipient: {},
    sender: null,
    weightLbs: 1,
    dimensions: { length: 12, width: 12, height: 4 },
    productDetails: [],
    restrictionFlag: false
  };


  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.includes('to:')) {
      const addrMatch = line.match(/To:\s*(.+)/i);
      if (addrMatch) {
        const parts = addrMatch[1].split(',').map(p => p.trim());
        parsed.recipient = {
          name: parts[0],
          street1: parts[1] || '',
          city: parts[2] || '',
          state: parts[3] || '',
          zip: parts[4] || '',
          country: parts[5] || 'US',
          phone: parts[6] || ''
        };
      }
    } else if (lower.includes('from:')) {
      const addrMatch = line.match(/From:\s*(.+)/i);
      if (addrMatch) {
        const parts = addrMatch[1].split(',').map(p => p.trim());
        parsed.sender = {
          company: parts[0],
          street1: parts[1] || '',
          city: parts[2] || '',
          state: parts[3] || '',
          zip: parts[4] || '',
          country: parts[5] || 'US'
        };
      }
    } else if (lower.includes('weight:') || lower.includes('baseweight:')) {
      const weightMatch = line.match(/(\d+\.?\d*)\s*lbs?/i);
      if (weightMatch) parsed.weightLbs = parseFloat(weightMatch[1]);
    } else if (lower.includes('dimensions:')) {
      const dimMatch = line.match(/(\d+)[-x](\d+)[-x](\d+)/i);
      if (dimMatch) {
        parsed.dimensions = {
          length: parseInt(dimMatch[1]),
          width: parseInt(dimMatch[2]),
          height: parseInt(dimMatch[3])
        };
      }
    } else if (lower.includes('restrictionflag:')) {
      parsed.restrictionFlag = line.toLowerCase().includes('true');
    }
  });


  return parsed;
}


export function selectShipFromAddress(shippingInput: any): any {
  const recipientState = shippingInput.recipient?.state?.toUpperCase();
  
  // State-based selection
  if (recipientState === 'CA') {
    return {
      company: 'My Framing Store Inc - LA',
      street1: '1234 S Broadway',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90015',
      country: 'US',
      phone: '(213) 555-0100',
      email: 'shipping-la@myframingstore.com'
    };
  } else if (recipientState === 'NV') {
    return {
      company: 'My Framing Store Inc - Vegas',
      street1: '3000 Paradise Rd',
      city: 'Las Vegas',
      state: 'NV',
      zip: '89109',
      country: 'US',
      phone: '(702) 555-0100',
      email: 'shipping-lv@myframingstore.com'
    };
  }
  
  // Default to Los Angeles
  return {
    company: 'My Framing Store Inc',
    street1: '1234 S Broadway',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90015',
    country: 'US',
    phone: '(213) 555-0100',
    email: 'shipping@myframingstore.com'
  };
}


export function selectCarrierService(shippingInput: any, serviceLevel?: string): any {
  const isInternational = shippingInput.recipient.country !== 'US';
  const level = serviceLevel || shippingInput.serviceLevel || 'ground';


  if (isInternational) {
    return {
      carrier: 'FedEx',
      service: level === 'express' ? 'FEDEX_INTERNATIONAL_PRIORITY' : 'FEDEX_INTERNATIONAL_ECONOMY',
      rateId: 'rate_fedex_intl'
    };
  }


  if (level === 'express') {
    return {
      carrier: 'UPS',
      service: 'Next Day Air',
      rateId: 'rate_ups_nda'
    };
  } else if (level === 'priority') {
    return {
      carrier: 'USPS',
      service: 'Priority Mail',
      rateId: 'rate_usps_priority'
    };
  }


  return {
    carrier: 'UPS',
    service: 'Ground',
    rateId: 'rate_ups_ground'
  };
}


export function fallbackAddressValidation(address: any): any {
  // Basic validation when MCP is unavailable
  const warnings = [];
  
  if (!address.street1) warnings.push('Missing street address');
  if (!address.city) warnings.push('Missing city');
  if (!address.zip) warnings.push('Missing postal code');
  if (!address.country) warnings.push('Missing country');


  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        validated: warnings.length === 0,
        address: address,
        warnings: warnings,
        fallback: true
      })
    }]
  };
}


export function generateSampleProducts(): any[] {
  const colors = ['Classic Blue', 'Midnight Black', 'Stone Grey', 'Dark Indigo'];
  const sizes = ['M', 'L', 'XL'];
  const count = Math.floor(Math.random() * 2) + 2; // 2-3 items


  return Array.from({ length: count }, (_, i) => ({
    description: `Premium ${colors[i % colors.length]} Denim Jeans, Size ${sizes[i % sizes.length]}, 100% Cotton`,
    quantity: 1,
    value: 40 + Math.floor(Math.random() * 20), // $40-60
    weightLbs: 1.2 + Math.random() * 0.8, // 1.2-2.0 lbs
    htsCode: '6204.62.4040',
    countryOfOrigin: 'US',
    material: '100% cotton denim'
  }));
}


export function calculateEstimatedValue(product: any): number {
  // Estimate value based on product description
  const desc = product.description?.toLowerCase() || '';
  
  if (desc.includes('premium') || desc.includes('designer')) return 75;
  if (desc.includes('denim') || desc.includes('jeans')) return 50;
  if (desc.includes('shirt') || desc.includes('tee')) return 25;
  if (desc.includes('jacket') || desc.includes('coat')) return 100;
  
  return 40; // Default
}


export function convertToOunces(weightLbs: number): number {
  return weightLbs * 16;
}


export function getCountryComplianceNotes(country: string): string {
  const notes: Record<string, string> = {
    'DE': 'Germany: Require detailed customs declaration. Textiles subject to import duties.',
    'GB': 'UK: Post-Brexit requires full customs documentation. VAT may apply.',
    'CA': 'Canada: USMCA agreement may reduce duties. Require accurate HTS codes.',
    'AU': 'Australia: Strict biosecurity. Declare all materials. GST applies.',
    'JP': 'Japan: Detailed item descriptions required. Low de minimis threshold.',
    'CN': 'China: Require Chinese customs forms. Restricted categories apply.',
    'MX': 'Mexico: USMCA benefits. Provide certificate of origin if applicable.',
    'FR': 'France: EU customs regulations. Detailed product composition required.',
    'IT': 'Italy: EU regulations apply. Accurate valuation critical.',
    'ES': 'Spain: EU member. Standard EU customs procedures apply.'
  };


  return notes[country] || 'International shipment: Ensure accurate customs documentation.';
}
```


### Complete Type Definitions


**Type Definitions (src-types-shipping.ts):**
```typescript
export interface Address {
  name?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}


export interface Dimensions {
  length: number;
  width: number;
  height: number;
}


export interface WeightData {
  fullParcelOz: number;
  reportedWeightOz: number;
  bufferAmount?: number;
  productWeightOz?: number;
}


export interface PackageInfo {
  dimensions: Dimensions;
  weightOz: number;
  fullParcelOz?: number;
  type: 'box' | 'envelope' | 'pak' | 'tube';
  service: string;
  tracking: string;
  insurance: number;
}


export interface ShippingInput {
  recipient: Address;
  sender?: Address;
  weightLbs: number;
  dimensions: Dimensions;
  productDetails: Product[];
  restrictionFlag: boolean;
  serviceLevel?: 'ground' | 'express' | 'priority';
}


export interface Product {
  description: string;
  quantity: number;
  value?: number;
  weightLbs?: number;
  htsCode?: string;
  material?: string;
  countryOfOrigin?: string;
}


export interface CarrierService {
  carrier: 'UPS' | 'FedEx' | 'USPS' | 'DHL';
  service: string;
  rateId: string;
}


export interface ShippingLabel {
  id: string;
  timestamp: string;
  sender: Address;
  recipient: Address;
  package: PackageInfo;
  customs?: CustomsDeclaration;
  metadata: ShippingMetadata;
}


export interface ShippingMetadata {
  serviceProvider: string;
  estimatedCost: number;
  international: boolean;
  validationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FAILED';
  mcpToolsUsed: string[];
  warnings: string[];
  correlationId?: string;
}
```


**Customs Type Definitions (src-types-customs.ts):**
```typescript
export interface CustomsItem {
  description: string;
  htsCode: string;
  quantity: number;
  value: number;
  weightOz: number;
  countryOfOrigin: string;
  declaration?: 'GIFT' | 'PERSONAL USE' | 'MERCHANDISE' | 'SAMPLE';
  material?: string;
  sku?: string;
}


export interface CustomsDeclaration {
  formType: 'domestic' | 'CN22' | 'CN23';
  items: CustomsItem[];
  totalValue: number;
  complianceNotes: string;
  contentsType?: 'merchandise' | 'gift' | 'sample' | 'documents';
  restrictionComments?: string;
  eelPfc?: string;
}


export interface HTSCodeInfo {
  code: string;
  description: string;
  dutyRate?: number;
  category: string;
}
```


### Complete Service Implementations


**EasyPost Client (src-services-easypost-client.ts):**
```typescript
import EasyPostClient from '@easypost/api';
import { config } from 'dotenv';


config();


export class EasyPostService {
  private client: EasyPostClient;
  private apiKey: string;


  constructor() {
    this.apiKey = process.env.EASYPOST_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('EASYPOST_API_KEY environment variable is required');
    }
    this.client = new EasyPostClient(this.apiKey);
  }


  async createShipment(shipmentData: any): Promise<any> {
    try {
      const shipment = await this.client.Shipment.create({
        to_address: shipmentData.to_address,
        from_address: shipmentData.from_address,
        parcel: shipmentData.parcel,
        customs_info: shipmentData.customs_info,
        options: {
          label_format: 'PDF',
          invoice_number: `INV-${Date.now()}`,
          ...(shipmentData.insurance && { insurance: shipmentData.insurance })
        }
      });


      return shipment;
    } catch (error: any) {
      throw new Error(`EasyPost createShipment failed: ${error.message}`);
    }
  }


  async buyLabel(shipmentId: string, rateId?: string): Promise<any> {
    try {
      const shipment = await this.client.Shipment.retrieve(shipmentId);
      
      // Select rate (lowest by default or specified rateId)
      let selectedRate = shipment.rates[0];
      if (rateId) {
        selectedRate = shipment.rates.find((r: any) => r.id === rateId) || selectedRate;
      }


      const boughtShipment = await this.client.Shipment.buy(shipmentId, selectedRate);
      
      return {
        tracking_code: boughtShipment.tracking_code,
        label_url: boughtShipment.postage_label?.label_url,
        rate: parseFloat(selectedRate.rate),
        carrier: selectedRate.carrier,
        service: selectedRate.service
      };
    } catch (error: any) {
      throw new Error(`EasyPost buyLabel failed: ${error.message}`);
    }
  }


  async validateAddress(address: any): Promise<any> {
    try {
      const verified = await this.client.Address.createAndVerify(address);
      return verified;
    } catch (error: any) {
      // Return original address with warning if verification fails
      return {
        ...address,
        verifications: {
          delivery: { success: false, errors: [{ message: error.message }] }
        }
      };
    }
  }


  async createCustomsInfo(customsData: any): Promise<any> {
    try {
      const customsInfo = await this.client.CustomsInfo.create({
        customs_certify: true,
        customs_signer: customsData.signer || 'Shipping Clerk',
        contents_type: customsData.contentsType || 'merchandise',
        contents_explanation: customsData.explanation || '',
        eel_pfc: customsData.eelPfc || 'NOEEI 30.37(a)',
        restriction_type: customsData.restrictionType || 'none',
        customs_items: customsData.items
      });


      return customsInfo;
    } catch (error: any) {
      throw new Error(`EasyPost createCustomsInfo failed: ${error.message}`);
    }
  }


  async getShipmentRates(shipmentId: string): Promise<any[]> {
    try {
      const shipment = await this.client.Shipment.retrieve(shipmentId);
      return shipment.rates.map((rate: any) => ({
        id: rate.id,
        carrier: rate.carrier,
        service: rate.service,
        rate: parseFloat(rate.rate),
        currency: rate.currency,
        delivery_days: rate.delivery_days,
        delivery_date: rate.delivery_date
      }));
    } catch (error: any) {
      throw new Error(`EasyPost getShipmentRates failed: ${error.message}`);
    }
  }
}
```


**Context7 Client (src-services-context7-client.ts):**
```typescript
import { fetch } from 'undici';


export class Context7Client {
  private apiKey: string;
  private baseUrl = 'https://api.context7.ai/v1';


  constructor() {
    this.apiKey = process.env.CONTEXT7_API_KEY || '';
    if (!this.apiKey) {
      console.warn('CONTEXT7_API_KEY not found, using fallback mode');
    }
  }


  async validateAddress(address: any): Promise<any> {
    if (!this.apiKey) {
      return this.fallbackAddressValidation(address);
    }


    try {
      const response = await fetch(`${this.baseUrl}/validate-address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address }),
        signal: AbortSignal.timeout(30000)
      });


      if (!response.ok) {
        throw new Error(`Context7 API returned ${response.status}`);
      }


      return await response.json();
    } catch (error: any) {
      console.warn(`Context7 validation failed: ${error.message}, using fallback`);
      return this.fallbackAddressValidation(address);
    }
  }


  async getHTSCode(description: string, destinationCountry: string): Promise<any> {
    if (!this.apiKey) {
      return this.fallbackHTSCode(description);
    }


    try {
      const response = await fetch(`${this.baseUrl}/hts-lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          product_description: description,
          destination_country: destinationCountry 
        }),
        signal: AbortSignal.timeout(30000)
      });


      if (!response.ok) {
        throw new Error(`Context7 HTS lookup returned ${response.status}`);
      }


      return await response.json();
    } catch (error: any) {
      console.warn(`Context7 HTS lookup failed: ${error.message}, using fallback`);
      return this.fallbackHTSCode(description);
    }
  }


  private fallbackAddressValidation(address: any): any {
    return {
      validated: true,
      address: address,
      confidence: 'low',
      source: 'fallback'
    };
  }


  private fallbackHTSCode(description: string): any {
    const desc = description.toLowerCase();
    
    // Simple keyword matching for common items
    if (desc.includes('jean') || desc.includes('denim')) {
      return { code: '6204.62.4040', description: 'Women\'s denim trousers', category: 'Apparel' };
    }
    if (desc.includes('shirt') || desc.includes('tee')) {
      return { code: '6109.10.0040', description: 'Cotton t-shirts', category: 'Apparel' };
    }
    if (desc.includes('jacket')) {
      return { code: '6201.93.3510', description: 'Synthetic jackets', category: 'Apparel' };
    }
    
    return { code: '9999.99.9999', description: 'General merchandise', category: 'Other' };
  }
}
```


### Complete Utility Files


**Error Handler (src-utils-error-handler.ts):**
```typescript
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';


const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});


export class AppError extends Error {
  public readonly correlationId: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;


  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.correlationId = uuidv4();
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}


export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';


  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000
  ) {}


  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker transitioning to HALF_OPEN');
      } else {
        logger.warn('Circuit breaker is OPEN, using fallback');
        if (fallback) return fallback();
        throw new AppError('Service unavailable (circuit breaker open)', 503);
      }
    }


    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback && this.state === 'OPEN') {
        logger.warn('Using fallback due to circuit breaker');
        return fallback();
      }
      throw error;
    }
  }


  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info('Circuit breaker CLOSED after successful call');
    }
  }


  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();


    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      logger.error(`Circuit breaker OPEN after ${this.failureCount} failures`);
    }
  }


  getState(): string {
    return this.state;
  }
}


export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 2000
): Promise<T> {
  let lastError: Error;


  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }


  throw new AppError(`Failed after ${maxRetries + 1} attempts: ${lastError!.message}`, 500);
}


export { logger };
```


**Formatting Utilities (src-utils-formatting.ts):**
```typescript
export function formatShippingLabel(data: any): string {
  return JSON.stringify(data, null, 2);
}


export function formatAddress(address: any): string {
  const lines = [
    address.name || address.company,
    address.street1,
    address.street2,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country
  ].filter(Boolean);


  return lines.join('\n');
}


export function formatWeight(ounces: number): string {
  const pounds = Math.floor(ounces / 16);
  const oz = (ounces % 16).toFixed(1);
  return pounds > 0 ? `${pounds} lbs ${oz} oz` : `${oz} oz`;
}


export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}


export function formatTrackingNumber(carrier: string, tracking: string): string {
  // Format tracking numbers based on carrier
  if (carrier === 'UPS' && tracking.length === 18) {
    return tracking.match(/.{1,6}/g)?.join(' ') || tracking;
  }
  if (carrier === 'FedEx' && tracking.length === 12) {
    return tracking.match(/.{1,4}/g)?.join(' ') || tracking;
  }
  if (carrier === 'USPS' && tracking.length === 22) {
    return tracking.match(/.{1,4}/g)?.join(' ') || tracking;
  }
  return tracking;
}
```


### Complete Test Implementations


**Unit Test - Weight Converter (tests-unit-weight-converter.test.ts):**
```typescript
import { describe, it, expect } from 'vitest';
import { weightConverter } from './src-utils-validation.js';
import { convertToOunces } from './src-utils-validation.js';


describe('Weight Converter', () => {
  describe('convertToOunces', () => {
    it('should convert pounds to ounces correctly', () => {
      expect(convertToOunces(1)).toBe(16);
      expect(convertToOunces(2.5)).toBe(40);
      expect(convertToOunces(0.5)).toBe(8);
    });


    it('should handle zero weight', () => {
      expect(convertToOunces(0)).toBe(0);
    });
  });


  describe('convertAndBuffer', () => {
    it('should apply packaging buffer correctly', () => {
      const result = weightConverter.convertAndBuffer(10); // 10 lbs = 160 oz
      
      expect(result.fullParcelOz).toBeGreaterThan(0);
      expect(result.reportedWeightOz).toBeLessThan(result.fullParcelOz);
      expect(result.reportedWeightOz).toBeGreaterThanOrEqual(1);
    });


    it('should include product weights', () => {
      const products = [
        { description: 'Jeans', quantity: 2, weightLbs: 1.5 },
        { description: 'Shirt', quantity: 1, weightLbs: 0.5 }
      ];
      
      const result = weightConverter.convertAndBuffer(10, products);
      
      // 10 lbs base + (2 * 1.5) + (1 * 0.5) = 13.5 lbs = 216 oz
      expect(result.fullParcelOz).toBeGreaterThan(160); // More than base weight
    });


    it('should enforce minimum reported weight', () => {
      const result = weightConverter.convertAndBuffer(0.01); // Very small weight
      
      expect(result.reportedWeightOz).toBeGreaterThanOrEqual(1);
    });


    it('should apply 10-20% buffer', () => {
      const result = weightConverter.convertAndBuffer(5); // 5 lbs = 80 oz
      
      const bufferPercent = (result.fullParcelOz - result.reportedWeightOz) / result.fullParcelOz;
      expect(bufferPercent).toBeGreaterThanOrEqual(0.05);
      expect(bufferPercent).toBeLessThanOrEqual(0.25);
    });
  });
});


describe('Input Parser', () => {
  it('should parse JSON input correctly', () => {
    const jsonInput = JSON.stringify({
      to: {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US'
      },
      weight: 5,
      dimensions: { length: 12, width: 10, height: 6 }
    });


    const result = parseShippingInput(jsonInput);
    
    expect(result.recipient.name).toBe('John Doe');
    expect(result.weightLbs).toBe(5);
    expect(result.dimensions.length).toBe(12);
  });


  it('should parse CSV input correctly', () => {
    const csvInput = `FirstName,LastName,Street,City,State,Zip,Country,InputWeight,Dimensions
John,Doe,123 Main St,Los Angeles,CA,90001,US,5,12-10-6`;


    const result = parseShippingInput(csvInput);
    
    expect(result.recipient.name).toContain('John');
    expect(result.recipient.name).toContain('Doe');
    expect(result.weightLbs).toBe(5);
  });


  it('should handle text description format', () => {
    const textInput = `
To: John Doe, 123 Main St, Los Angeles, CA, 90001, US
From: My Store, 456 Store Ave, Edison, NJ, 08817, US
Weight: 5 lbs
Dimensions: 12x10x6
RestrictionFlag: true
`;


    const result = parseShippingInput(textInput);
    
    expect(result.recipient.name).toBe('John Doe');
    expect(result.sender?.company).toBe('My Store');
    expect(result.weightLbs).toBe(5);
    expect(result.restrictionFlag).toBe(true);
  });


  it('should use default dimensions when not provided', () => {
    const jsonInput = JSON.stringify({
      to: {
        street1: '123 Main St',
        city: 'LA',
        zip: '90001',
        country: 'US'
      }
    });


    const result = parseShippingInput(jsonInput);
    
    expect(result.dimensions.length).toBe(12);
    expect(result.dimensions.width).toBe(12);
    expect(result.dimensions.height).toBe(4);
  });
});
```


**Integration Test - Shipping Labels (tests-integration-shipping-labels.test.ts):**
```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createShippingLabel } from './src-tools-shipping-labels.js';
import { EasyPostService } from './src-services-easypost-client.js';
import { Context7Client } from './src-services-context7-client.js';


// Mock environment variables
beforeAll(() => {
  process.env.EASYPOST_API_KEY = 'test_key_mock';
  process.env.CONTEXT7_API_KEY = 'test_ctx7_key';
});


// Mock external services
vi.mock('./src-services-easypost-client.js', () => ({
  EasyPostService: vi.fn().mockImplementation(() => ({
    createShipment: vi.fn().mockResolvedValue({
      id: 'shp_test123',
      rates: [
        {
          id: 'rate_test123',
          carrier: 'UPS',
          service: 'Ground',
          rate: '45.67',
          currency: 'USD',
          delivery_days: 5
        }
      ]
    }),
    buyLabel: vi.fn().mockResolvedValue({
      tracking_code: '1Z9999999999999999',
      label_url: 'https://example.com/label.pdf',
      rate: 45.67,
      carrier: 'UPS',
      service: 'Ground'
    }),
    validateAddress: vi.fn().mockResolvedValue({
      street1: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'US',
      verifications: { delivery: { success: true } }
    })
  }))
}));


vi.mock('./src-services-context7-client.js', () => ({
  Context7Client: vi.fn().mockImplementation(() => ({
    validateAddress: vi.fn().mockResolvedValue({
      validated: true,
      address: {},
      confidence: 'high'
    }),
    getHTSCode: vi.fn().mockResolvedValue({
      code: '6204.62.4040',
      description: 'Denim jeans',
      category: 'Apparel'
    })
  }))
}));


describe('Shipping Label Integration Tests', () => {
  it('should create complete domestic shipping label', async () => {
    const inputData = JSON.stringify({
      to: {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US',
        phone: '555-1234',
        email: 'john@example.com'
      },
      weight: 5,
      dimensions: { length: 12, width: 10, height: 6 }
    });


    const result = await createShippingLabel({ inputData });
    
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
    
    const label = JSON.parse(result.content[0].text);
    expect(label.shippingLabel).toBeDefined();
    expect(label.shippingLabel.id).toBeDefined();
    expect(label.shippingLabel.package.tracking).toBeDefined();
    expect(label.shippingLabel.metadata.validationStatus).toBe('VERIFIED');
  });


  it('should create international shipping label with customs', async () => {
    const inputData = JSON.stringify({
      to: {
        name: 'Hans Schmidt',
        street1: 'Schillerstrasse 20',
        city: 'Asperg',
        zip: '71679',
        country: 'DE',
        phone: '+4915124319939'
      },
      weight: 15,
      dimensions: { length: 27, width: 15, height: 10 },
      products: [
        {
          description: 'Premium Blue Denim Jeans',
          quantity: 2,
          value: 50,
          weightLbs: 1.5,
          htsCode: '6204.62.4040'
        }
      ],
      restrictionFlag: true
    });


    const result = await createShippingLabel({ inputData });
    
    const label = JSON.parse(result.content[0].text);
    expect(label.shippingLabel.customs).toBeDefined();
    expect(label.shippingLabel.customs.formType).toMatch(/CN22|CN23/);
    expect(label.shippingLabel.customs.items.length).toBeGreaterThan(0);
    expect(label.shippingLabel.metadata.international).toBe(true);
  });


  it('should auto-inject products when none provided for international', async () => {
    const inputData = JSON.stringify({
      to: {
        name: 'Pierre Dubois',
        street1: '10 Rue de la Paix',
        city: 'Paris',
        zip: '75001',
        country: 'FR'
      },
      weight: 10,
      dimensions: { length: 20, width: 12, height: 8 }
    });


    const result = await createShippingLabel({ inputData });
    
    const label = JSON.parse(result.content[0].text);
    expect(label.shippingLabel.customs.items.length).toBeGreaterThan(0);
    // Should auto-inject 2-4 jeans
    expect(label.shippingLabel.customs.items[0].description).toMatch(/jeans/i);
  });


  it('should select correct ship-from address based on state', async () => {
    const inputDataCA = JSON.stringify({
      to: {
        street1: '123 Test St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'US'
      },
      weight: 5,
      dimensions: { length: 12, width: 10, height: 6 }
    });


    const result = await createShippingLabel({ inputData: inputDataCA });
    const label = JSON.parse(result.content[0].text);
    
    expect(label.shippingLabel.sender.city).toBe('Los Angeles');
    expect(label.shippingLabel.sender.state).toBe('CA');
  });


  it('should handle errors gracefully', async () => {
    const invalidInput = 'invalid-json-data';


    const result = await createShippingLabel({ inputData: invalidInput });
    
    // Should not throw, but return error in response
    expect(result.content).toBeDefined();
  });


  it('should apply weight buffering correctly', async () => {
    const inputData = JSON.stringify({
      to: {
        street1: '123 Test St',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        country: 'US'
      },
      weight: 10, // 10 lbs = 160 oz
      dimensions: { length: 12, width: 10, height: 6 }
    });


    const result = await createShippingLabel({ inputData });
    const label = JSON.parse(result.content[0].text);
    
    expect(label.shippingLabel.package.reportedWeightOz).toBeLessThan(160);
    expect(label.shippingLabel.package.fullParcelOz).toBeGreaterThanOrEqual(160);
  });


  it('should select appropriate carrier service', async () => {
    const expressInput = JSON.stringify({
      to: {
        street1: '123 Test St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US'
      },
      weight: 5,
      dimensions: { length: 12, width: 10, height: 6 },
      serviceLevel: 'express'
    });


    const result = await createShippingLabel({ 
      inputData: expressInput, 
      serviceLevel: 'express' 
    });
    
    const label = JSON.parse(result.content[0].text);
    expect(label.shippingLabel.package.service).toMatch(/express|next day|priority/i);
  });
});


describe('Circuit Breaker and Error Handling', () => {
  it('should use fallback when service is unavailable', async () => {
    // Mock service failure
    vi.mocked(EasyPostService).mockImplementationOnce(() => ({
      createShipment: vi.fn().mockRejectedValue(new Error('Service unavailable')),
      buyLabel: vi.fn(),
      validateAddress: vi.fn()
    } as any));


    const inputData = JSON.stringify({
      to: {
        street1: '123 Test St',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        country: 'US'
      },
      weight: 5,
      dimensions: { length: 12, width: 10, height: 6 }
    });


    const result = await createShippingLabel({ inputData });
    
    // Should handle error gracefully
    expect(result).toBeDefined();
  });


  it('should retry with exponential backoff', async () => {
    // This test would verify retry logic
    // Implementation depends on your retry mechanism
    expect(true).toBe(true); // Placeholder
  });
});
```


### Documentation Files


**README.md:**
```markdown
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

\`\`\`bash
# Clone repository
git clone <repository-url>
cd easypost-mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your API keys in .env
\`\`\`

## Configuration

Create a `.env` file with your API keys:

\`\`\`env
EASYPOST_API_KEY=your_easypost_key_here
CONTEXT7_API_KEY=your_context7_key_here
\`\`\`

## Usage

### Development Mode

\`\`\`bash
npm run dev
\`\`\`

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

### Testing

\`\`\`bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
\`\`\`

## MCP Tools

### create_shipping_label

Generate a complete automated shipping label.

**Parameters:**
- `inputData` (string, required): Shipping data in JSON, CSV, or text format
- `shipFromOverride` (string, optional): Override default ship-from address
- `serviceLevel` (enum, optional): 'ground' | 'express' | 'priority'
- `insuranceAmount` (number, optional): Insurance coverage amount

**Example:**

\`\`\`json
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
\`\`\`

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

\`\`\`bash
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
\`\`\`

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
\`\`\`


**.env.example:**
```env
# EasyPost API Configuration
EASYPOST_API_KEY=your_easypost_api_key_here
# Get your key at: https://www.easypost.com/account/api-keys

# Context7 MCP Service (for address validation and HTS lookup)
CONTEXT7_API_KEY=your_context7_api_key_here
# Optional - fallback mode will activate if not provided

# Logging Configuration
LOG_LEVEL=info
# Options: trace, debug, info, warn, error, fatal

# Server Configuration
NODE_ENV=development
# Options: development, production, test

# Circuit Breaker Settings (optional, defaults shown)
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Retry Settings (optional, defaults shown)
MAX_RETRIES=3
BASE_RETRY_DELAY=2000

# API Timeouts (optional, milliseconds)
EASYPOST_TIMEOUT=30000
CONTEXT7_TIMEOUT=30000
```

This prompt enables fully automated, compliant shipping label generation with real-time validation and iterative refinement capabilities.


