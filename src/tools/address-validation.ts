import { Context7Client } from '../services/context7-client.js';

export const addressValidationTool = {
  name: 'validate_address',
  description: 'Validate and verify shipping addresses using MCP context7 service',
  inputSchema: {
    type: 'object',
    properties: {
      address: {
        type: 'object',
        description: 'Address to validate',
        properties: {
          name: { type: 'string' },
          company: { type: 'string' },
          street1: { type: 'string' },
          street2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zip: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' }
        },
        required: ['street1', 'city', 'zip', 'country']
      }
    },
    required: ['address']
  }
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

function fallbackAddressValidation(address: any): any {
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

export const addressValidator = {
  validateAddress
};

