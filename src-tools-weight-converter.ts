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
    reportedWeightOz: Math.max(1, reportedWeight), // Minimum 1 oz
    bufferAmount,
    productWeightOz
  };
}

export const weightConverter = {
  convertAndBuffer
};

