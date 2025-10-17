export const carrierSelectorTool = {
  name: 'select_carrier',
  description: 'Select appropriate carrier and service level based on shipment details',
  inputSchema: {
    type: 'object',
    properties: {
      destinationCountry: {
        type: 'string',
        description: 'ISO country code of destination'
      },
      serviceLevel: {
        type: 'string',
        enum: ['ground', 'express', 'priority'],
        description: 'Desired service level'
      }
    },
    required: ['destinationCountry']
  }
};

export function selectCarrierService(shippingInput: any, serviceLevel?: string): any {
  const isInternational = shippingInput.recipient?.country !== 'US';
  const level = serviceLevel || shippingInput.serviceLevel || 'ground';

  // International shipping logic with multiple carrier options
  if (isInternational) {
    const destinationCountry = shippingInput.recipient?.country || 'DE';

    // EU countries - use DHL for faster delivery
    if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'DK', 'SE', 'NO', 'FI'].includes(destinationCountry)) {
      return {
        carrier: 'DHL',
        service: level === 'express' ? 'DHL_EXPRESS_WORLDWIDE' : 'DHL_ECOMMERCE_STANDARD',
        rateId: 'rate_dhl_intl',
        estimatedDays: level === 'express' ? 2 : 5
      };
    }

    // Canada - use UPS for better coverage
    if (destinationCountry === 'CA') {
      return {
        carrier: 'UPS',
        service: level === 'express' ? 'UPS_WORLDWIDE_EXPRESS' : 'UPS_STANDARD_TO_CANADA',
        rateId: 'rate_ups_ca',
        estimatedDays: level === 'express' ? 2 : 4
      };
    }

    // Default international - FedEx
    return {
      carrier: 'FedEx',
      service: level === 'express' ? 'FEDEX_INTERNATIONAL_PRIORITY' : 'FEDEX_INTERNATIONAL_ECONOMY',
      rateId: 'rate_fedex_intl',
      estimatedDays: level === 'express' ? 3 : 7
    };
  }

  // Domestic US shipping with cost optimization
  if (level === 'express') {
    return {
      carrier: 'UPS',
      service: 'Next Day Air',
      rateId: 'rate_ups_nda',
      estimatedDays: 1,
      costEstimate: 'high'
    };
  } else if (level === 'priority') {
    return {
      carrier: 'USPS',
      service: 'Priority Mail',
      rateId: 'rate_usps_priority',
      estimatedDays: 2,
      costEstimate: 'medium'
    };
  }

  // Ground service - UPS for reliability
  return {
    carrier: 'UPS',
    service: 'Ground',
    rateId: 'rate_ups_ground',
    estimatedDays: 3,
    costEstimate: 'low'
  };
}

export const carrierSelector = {
  selectCarrierService
};

