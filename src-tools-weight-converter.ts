import { convertToOunces } from './src-utils-validation.js';

export const weightConverterTool = {
  name: 'convert_weight',
  description: 'Convert weights from pounds to ounces and apply packaging buffer',
  inputSchema: {
    type: 'object',
    properties: {
      weightLbs: {
        type: 'number',
        description: 'Weight in pounds'
      },
      productDetails: {
        type: 'array',
        description: 'Optional product details for weight calculation',
        items: {
          type: 'object',
          properties: {
            weightLbs: { type: 'number' },
            quantity: { type: 'number' }
          }
        }
      }
    },
    required: ['weightLbs']
  }
};

export function convertAndBuffer(weightLbs: number, productDetails?: any[]) {
  // ALWAYS convert pounds to ounces (1 lb = 16 oz) for EasyPost API
  const weightOz = weightLbs * 16;

  // Add individual product weights (each product weight * quantity)
  const productWeightOz = productDetails ?
    productDetails.reduce((sum, p) => sum + (convertToOunces(p.weightLbs || 1.5) * (p.quantity || 1)), 0) : 0;

  // Total parcel weight = base weight + all products
  const fullParcelOz = weightOz + productWeightOz;

  // Apply 10-20% packaging buffer to account for box, padding, tape, etc.
  const bufferPercent = 0.15; // 15% default buffer
  const bufferAmount = Math.max(0.5, fullParcelOz * bufferPercent); // Minimum 0.5 oz buffer
  
  // Reported weight after buffer reduction (this prevents overage charges)
  const reportedWeight = fullParcelOz - bufferAmount;

  // Safety: Ensure reported weight is at least 85% of full weight and minimum 1oz
  const minReportedWeight = Math.max(1, fullParcelOz * 0.85);
  const finalReportedWeight = Math.max(minReportedWeight, reportedWeight);

  return {
    fullParcelOz: fullParcelOz,
    reportedWeightOz: finalReportedWeight, // THIS is sent to EasyPost API (always in ounces)
    bufferAmount,
    productWeightOz,
    bufferPercent: bufferPercent * 100 // Return as percentage for transparency
  };
}

export const weightConverter = {
  convertAndBuffer
};

