import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema, 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';

// Import all tools
import { shippingLabelTool, createShippingLabel } from './src-tools-shipping-labels.js';
import { addressValidationTool, validateAddress } from './src-tools-address-validation.js';
import { customsCalculatorTool, generateCustoms } from './src-tools-customs-calculator.js';
import { weightConverterTool, convertAndBuffer } from './src-tools-weight-converter.js';
import { carrierSelectorTool, selectCarrierService } from './src-tools-carrier-selector.js';

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
      carrierSelectorTool
    ]
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_shipping_label':
        return await createShippingLabel(args);
      case 'validate_address':
        return await validateAddress(args.address);
      case 'calculate_customs':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(
              await generateCustoms(args.products, args.destinationCountry, args.restrictionFlag),
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
              convertAndBuffer(args.weightLbs, args.productDetails),
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
              selectCarrierService({ recipient: { country: args.destinationCountry } }, args.serviceLevel),
              null,
              2
            )
          }]
        };
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

