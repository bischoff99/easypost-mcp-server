import { fetch } from 'undici';
import { serverConfig } from './src-config.js';

export class Context7Client {
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = serverConfig.context7.apiKey;
    this.baseUrl = serverConfig.context7.baseUrl;

    if (!this.apiKey) {
      console.warn('CONTEXT7_API_KEY not found, using fallback mode');
    }
  }

  async validateAddress(address: any): Promise<any> {
    if (!this.apiKey) {
      return this.fallbackAddressValidation(address);
    }

    try {
      const response = await fetch(`${this.baseUrl}/validate-address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Context7 API returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`Context7 validation failed: ${error.message}, using fallback`);
      return this.fallbackAddressValidation(address);
    }
  }

  async getHTSCode(description: string, destinationCountry: string): Promise<any> {
    if (!this.apiKey) {
      return this.fallbackHTSCode(description);
    }

    try {
      const response = await fetch(`${this.baseUrl}/hts-lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          product_description: description,
          destination_country: destinationCountry 
        }),
        signal: AbortSignal.timeout(serverConfig.context7.timeout)
      });

      if (!response.ok) {
        throw new Error(`Context7 HTS lookup returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`Context7 HTS lookup failed: ${error.message}, using fallback`);
      return this.fallbackHTSCode(description);
    }
  }

  private fallbackAddressValidation(address: any): any {
    return {
      validated: true,
      address: address,
      confidence: 'low',
      source: 'fallback'
    };
  }

  private fallbackHTSCode(description: string): any {
    const desc = description.toLowerCase();
    
    // Simple keyword matching for common items
    if (desc.includes('jean') || desc.includes('denim')) {
      return { code: '6204.62.4040', description: 'Women\'s denim trousers', category: 'Apparel' };
    }
    if (desc.includes('shirt') || desc.includes('tee')) {
      return { code: '6109.10.0040', description: 'Cotton t-shirts', category: 'Apparel' };
    }
    if (desc.includes('jacket')) {
      return { code: '6201.93.3510', description: 'Synthetic jackets', category: 'Apparel' };
    }
    
    return { code: '9999.99.9999', description: 'General merchandise', category: 'Other' };
  }
}

