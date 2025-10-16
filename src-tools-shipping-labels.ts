import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EasyPostService } from './src-services-easypost-client.js';
import { Context7Client } from './src-services-context7-client.js';
import { weightConverter } from './src-tools-weight-converter.js';
import { addressValidator } from './src-tools-address-validation.js';
import { customsCalculator } from './src-tools-customs-calculator.js';
import { parseShippingInput, selectShipFromAddress, selectCarrierService } from './src-utils-validation.js';

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
      shippingInput.recipient.country,
      shippingInput.restrictionFlag
    );

    // Select carrier and service
    const carrierService = selectCarrierService(shippingInput, args.serviceLevel);

    // Create EasyPost shipment
    const easyPostClient = new EasyPostService();
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
              mcpToolsUsed: ['context7', 'easypost'],
              warnings: []
            }
          }
        }, null, 2)
      }]
    };

  } catch (error: any) {
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

