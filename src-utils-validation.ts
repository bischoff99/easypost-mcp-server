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

