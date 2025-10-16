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

export const carrierSelector = {
  selectCarrierService
};

