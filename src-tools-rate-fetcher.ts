import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EasyPostService } from './src-services-easypost-client.js';
import { parseShippingInput, selectShipFromAddress } from './src-utils-validation.js';
import { weightConverter } from './src-tools-weight-converter.js';

const getRatesSchema = z.object({
  inputData: z.string().describe('Shipping input data (CSV, JSON, or text description)'),
  shipFromOverride: z.string().optional().describe('Override default ship-from address')
});

export const rateFetcherTool: Tool = {
  name: 'get_shipping_rates',
  description: 'Get available shipping rates and options without purchasing a label',
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
      }
    },
    required: ['inputData']
  }
};

export async function getShippingRates(args: any) {
  try {
    // Parse input data
    const shippingInput = parseShippingInput(args.inputData);

    // Determine ship-from address
    const shipFrom = args.shipFromOverride || selectShipFromAddress(shippingInput);

    // Convert and buffer weights
    const weightData = weightConverter.convertAndBuffer(shippingInput.weightLbs, shippingInput.productDetails);

    // Create EasyPost shipment (without buying)
    const easyPostClient = new EasyPostService();
    
    const shipmentData = {
      from_address: shipFrom,
      to_address: shippingInput.recipient,
      parcel: {
        length: shippingInput.dimensions.length,
        width: shippingInput.dimensions.width,
        height: shippingInput.dimensions.height,
        weight: weightData.reportedWeightOz
      }
    };

    const shipment = await easyPostClient.createShipment(shipmentData);
    const rates = await easyPostClient.getShipmentRates(shipment.id);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          shipmentId: shipment.id,
          recipient: shippingInput.recipient,
          package: {
            dimensions: shippingInput.dimensions,
            weightOz: weightData.reportedWeightOz,
            weightLbs: shippingInput.weightLbs
          },
          availableRates: rates.sort((a: any, b: any) => a.rate - b.rate),
          cheapestRate: rates.reduce((min: any, rate: any) => 
            rate.rate < min.rate ? rate : min, rates[0]),
          fastestRate: rates.reduce((min: any, rate: any) => 
            (rate.delivery_days || 99) < (min.delivery_days || 99) ? rate : min, rates[0])
        }, null, 2)
      }]
    };

  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.message,
          status: 'FAILED',
          warnings: ['Failed to fetch shipping rates']
        }, null, 2)
      }],
      isError: true
    };
  }
}

