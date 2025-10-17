import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema, 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';

// Import all tools
import { shippingLabelTool, createShippingLabel } from './tools/shipping-labels.js';
import { addressValidationTool, validateAddress } from './tools/address-validation.js';
import { customsCalculatorTool, generateCustoms } from './tools/customs-calculator.js';
import { weightConverterTool, convertAndBuffer } from './tools/weight-converter.js';
import { carrierSelectorTool, selectCarrierService } from './tools/carrier-selector.js';
import { rateFetcherTool, getShippingRates } from './tools/rate-fetcher.js';

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
      customsCalculatorTool,
      weightConverterTool,
      carrierSelectorTool,
      rateFetcherTool
    ]
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Missing required arguments'
    );
  }

  try {
    switch (name) {
      case 'create_shipping_label':
        return await createShippingLabel(args);
      case 'validate_address':
        return await validateAddress((args as any).address);
      case 'calculate_customs':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(
              await generateCustoms((args as any).products, (args as any).destinationCountry, (args as any).restrictionFlag),
              null,
              2
            )
          }]
        };
      case 'convert_weight':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(
              convertAndBuffer((args as any).weightLbs, (args as any).productDetails),
              null,
              2
            )
          }]
        };
      case 'select_carrier':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(
              selectCarrierService({ recipient: { country: (args as any).destinationCountry } }, (args as any).serviceLevel),
              null,
              2
            )
          }]
        };
      case 'get_shipping_rates':
        return await getShippingRates(args);
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

