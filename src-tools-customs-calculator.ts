import { Context7Client } from './src-services-context7-client.js';
import { convertToOunces, calculateEstimatedValue, generateSampleProducts, getCountryComplianceNotes } from './src-utils-validation.js';

export const customsCalculatorTool = {
  name: 'calculate_customs',
  description: 'Generate customs declarations with HTS codes and compliance information',
  inputSchema: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        description: 'Array of products to declare',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number' },
            value: { type: 'number' },
            weightLbs: { type: 'number' },
            htsCode: { type: 'string' }
          }
        }
      },
      destinationCountry: {
        type: 'string',
        description: 'ISO country code of destination'
      },
      restrictionFlag: {
        type: 'boolean',
        description: 'Whether shipment has restrictions'
      }
    },
    required: ['destinationCountry']
  }
};

export async function generateCustoms(products: any[], destinationCountry: string, restrictionFlag = false) {
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
      declaration: restrictionFlag ? 'PERSONAL USE' : 'GIFT'
    });
  }

  return {
    formType: destinationCountry === 'US' ? 'domestic' : 'CN22',
    items: customsItems,
    totalValue: customsItems.reduce((sum, item) => sum + item.value, 0),
    complianceNotes: getCountryComplianceNotes(destinationCountry)
  };
}

export const customsCalculator = {
  generateCustoms
};

