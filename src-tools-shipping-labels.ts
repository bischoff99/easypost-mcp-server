import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EasyPostService } from './src-services-easypost-client.js';
import { Context7Client } from './src-services-context7-client.js';
import { weightConverter } from './src-tools-weight-converter.js';
import { addressValidator } from './src-tools-address-validation.js';
import { customsCalculator } from './src-tools-customs-calculator.js';
import { parseShippingInput, selectShipFromAddress, selectCarrierService } from './src-utils-validation.js';
import { serverConfig } from './src-config.js';

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
  let shippingInput: any;
  let weightData: any;
  
  try {
    // Parse input data
    shippingInput = parseShippingInput(args.inputData);

    // Determine ship-from address
    const shipFrom = args.shipFromOverride || selectShipFromAddress(shippingInput);

    // Convert and buffer weights (always in ounces for EasyPost)
    weightData = weightConverter.convertAndBuffer(shippingInput.weightLbs, shippingInput.productDetails);

    // Create EasyPost client first
    const easyPostClient = new EasyPostService();

    // Check if using test API key
    const isTestMode = serverConfig.easypost.apiKey.startsWith('EZAK') || 
                       serverConfig.easypost.apiKey.startsWith('EZTK');

    // Generate customs declarations for international shipments
    // Now works with provided HTS codes - no external API calls needed if HTS codes are in CSV
    let customs = null;
    const isInternational = shippingInput.recipient.country !== 'US';
    if (isInternational && shippingInput.productDetails && shippingInput.productDetails.length > 0) {
      try {
        const customsData = await customsCalculator.generateCustoms(
          shippingInput.productDetails,
          shippingInput.recipient.country,
          shippingInput.restrictionFlag
        );
        
        // Convert to EasyPost CustomsInfo format
        const customsItems = customsData.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          value: item.value,
          weight: item.weightOz,
          hs_tariff_number: item.htsCode,
          origin_country: item.countryOfOrigin || 'US'
        }));
        
        // Create EasyPost CustomsInfo object
        customs = await easyPostClient.createCustomsInfo({
          contentsType: 'merchandise',
          restrictionType: shippingInput.restrictionFlag ? 'other' : 'none',
          eelPfc: 'NOEEI 30.37(a)',
          signer: 'Shipping Clerk',
          items: customsItems
        });
        
        console.error(`Customs info generated with ${customsItems.length} items`);
      } catch (error: any) {
        console.error('Customs generation failed, proceeding without customs:', error.message);
        if (isTestMode) {
          console.error('Note: In test mode, customs generation may fail. Continuing without customs.');
        }
      }
    }
    const shipmentData: any = {
      from_address: shipFrom,
      to_address: shippingInput.recipient,
      parcel: {
        length: shippingInput.dimensions.length,
        width: shippingInput.dimensions.width,
        height: shippingInput.dimensions.height,
        weight: weightData.reportedWeightOz
      }
    };

    // Add customs info if available
    if (customs) {
      shipmentData.customs_info = customs;
    }

    // Add insurance if specified
    if (args.insuranceAmount) {
      shipmentData.insurance = args.insuranceAmount;
    }

    // Debug: Log what we're sending to EasyPost
    console.error('Creating shipment with data:', JSON.stringify({
      hasCustoms: !!shipmentData.customs_info,
      fromCountry: shipmentData.from_address?.country,
      toCountry: shipmentData.to_address?.country,
      weightOz: shipmentData.parcel?.weight,
      dimensions: shipmentData.parcel
    }, null, 2));

    const shipment = await easyPostClient.createShipment(shipmentData);

    // Debug: Log shipment details
    console.error('Shipment created:', JSON.stringify({
      id: shipment.id,
      hasRates: !!shipment.rates,
      rateCount: shipment.rates?.length || 0,
      fromAddress: shipment.from_address?.city,
      toAddress: shipment.to_address?.city,
      parcelWeight: shipment.parcel?.weight
    }, null, 2));

    // Check if shipment has rates
    if (!shipment.rates || shipment.rates.length === 0) {
      // Log full shipment for debugging
      console.error('Shipment without rates:', JSON.stringify(shipment, null, 2));
      throw new Error(`No shipping rates available. Shipment ID: ${shipment.id}. This may be due to invalid addresses or test API limitations. Please verify addresses and try again.`);
    }

    // Select rate based on preferred carrier from CSV input
    let selectedRate = null;
    const preferredCarrier = shippingInput.preferredCarrier; // FEDEX, UPS, USPS from column 1
    
    console.error(`\n=== RATE SELECTION ===`);
    console.error(`Preferred carrier from CSV: ${preferredCarrier}`);
    console.error(`Total rates available: ${shipment.rates.length}`);
    
    if (preferredCarrier && preferredCarrier !== '') {
      // Map CSV carrier name to EasyPost carrier names
      const carrierMapping: any = {
        'FEDEX': ['fedex', 'fedexdefault'],
        'UPS': ['ups', 'upsdap'],
        'USPS': ['usps'],
        'DHL': ['dhl', 'dhlexpress']
      };
      
      const carrierPatterns = carrierMapping[preferredCarrier] || [preferredCarrier.toLowerCase()];
      console.error(`Looking for carriers matching: ${carrierPatterns.join(', ')}`);
      
      // Filter rates by preferred carrier
      const carrierRates = shipment.rates.filter((rate: any) => {
        const carrierLower = rate.carrier.toLowerCase();
        return carrierPatterns.some((pattern: string) => carrierLower.includes(pattern));
      });
      
      console.error(`Found ${carrierRates.length} rates for ${preferredCarrier}`);
      
      if (carrierRates.length > 0) {
        // For FedEx, prefer International Priority Express DDP
        if (preferredCarrier === 'FEDEX') {
          selectedRate = carrierRates.find((r: any) => 
            r.service.includes('PRIORITY_EXPRESS')
          ) || carrierRates.find((r: any) => 
            r.service.includes('INTERNATIONAL_PRIORITY')
          ) || carrierRates[0];
          console.error(`Selected FedEx service: ${selectedRate.service}`);
        } else {
          selectedRate = carrierRates[0]; // Cheapest from preferred carrier
        }
        console.error(`✅ Selected ${selectedRate.carrier} ${selectedRate.service} - $${selectedRate.rate}`);
      } else {
        console.error(`⚠️  Preferred carrier ${preferredCarrier} not available, using cheapest rate`);
      }
    }
    
    // Fall back to cheapest rate if no preference or carrier not available
    if (!selectedRate) {
      selectedRate = shipment.rates[0];
      console.error(`Using cheapest rate: ${selectedRate.carrier} ${selectedRate.service}`);
    }

    // Buy label with selected rate
    // Pass the shipment object directly to avoid retrieval issues
    const label = await easyPostClient.buyLabel(shipment.id, selectedRate.id, shipment);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          shippingLabel: {
            id: shipment.id,
            tracking_code: label.tracking_code,
            label_url: label.label_url,
            timestamp: new Date().toISOString(),
            sender: shipFrom,
            recipient: shippingInput.recipient,
            package: {
              dimensions: shippingInput.dimensions,
              weightOz: weightData.reportedWeightOz,
              fullParcelOz: weightData.fullParcelOz,
              type: 'box',
              service: label.service,
              carrier: label.carrier,
              insurance: args.insuranceAmount || 0
            },
            customs: customs,
            metadata: {
              serviceProvider: label.carrier,
              estimatedCost: label.rate,
              international: shippingInput.recipient.country !== 'US',
              validationStatus: 'CREATED',
              mcpToolsUsed: ['easypost'],
              warnings: []
            }
          }
        }, null, 2)
      }]
    };

  } catch (error: any) {
    // Return detailed error information for debugging
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.message,
          errorStack: error.stack?.split('\n').slice(0, 3).join('\n'),
          validationStatus: 'FAILED',
          warnings: ['Failed to generate shipping label'],
          debugInfo: {
            parsedRecipient: shippingInput?.recipient?.city || 'N/A',
            weightOz: weightData?.reportedWeightOz || 'N/A',
            isTestMode: serverConfig.easypost.apiKey.startsWith('EZAK'),
            isInternational: shippingInput?.recipient?.country !== 'US'
          }
        }, null, 2)
      }],
      isError: true
    };
  }
}

