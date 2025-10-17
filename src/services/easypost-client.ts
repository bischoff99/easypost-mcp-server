import EasyPostClient from '@easypost/api';
import { serverConfig } from '../config/index.js';

export class EasyPostService {
  private client: any;
  private apiKey: string;

  constructor() {
    this.apiKey = serverConfig.easypost.apiKey;
    if (!this.apiKey) {
      throw new Error('EASYPOST_API_KEY environment variable is required');
    }
    this.client = new EasyPostClient(this.apiKey);
  }

  async createShipment(shipmentData: any): Promise<any> {
    try {
      const createData: any = {
        to_address: shipmentData.to_address,
        from_address: shipmentData.from_address,
        parcel: shipmentData.parcel,
        options: {
          label_format: 'PDF',
          invoice_number: `INV-${Date.now()}`,
          incoterm: 'DDP',  // Request Delivered Duty Paid for international shipments
          ...(shipmentData.insurance && { insurance: shipmentData.insurance })
        }
      };

      // Only add customs_info if it exists and is not null/undefined
      if (shipmentData.customs_info) {
        createData.customs_info = shipmentData.customs_info;
      }

      const shipment = await this.client.Shipment.create(createData);

      return shipment;
    } catch (error: any) {
      throw new Error(`EasyPost createShipment failed: ${error.message}`);
    }
  }

  async buyLabel(shipmentId: string, rateId?: string, shipmentObject?: any): Promise<any> {
    try {
      // Use provided shipment object if available, otherwise retrieve it
      let shipment = shipmentObject;
      if (!shipment) {
        console.error('No shipment object provided, retrieving...');
        shipment = await this.client.Shipment.retrieve(shipmentId);
      } else {
        console.error('Shipment object provided:', {
          id: shipment.id,
          hasRates: !!shipment.rates,
          rateCount: shipment.rates?.length || 0,
          isObject: typeof shipment === 'object'
        });
      }
      
      // Check if rates are available
      if (!shipment.rates || shipment.rates.length === 0) {
        const shipmentInfo = {
          id: shipment.id,
          hasRatesProperty: 'rates' in shipment,
          ratesType: typeof shipment.rates,
          ratesLength: shipment.rates?.length || 0,
          shipmentKeys: Object.keys(shipment).slice(0, 10),
          hasMessages: !!shipment.messages,
          messages: shipment.messages
        };
        console.error('ERROR: No rates in shipment:', JSON.stringify(shipmentInfo, null, 2));
        throw new Error(`No rates available for this shipment (ID: ${shipment.id}). Shipment was created but returned ${shipment.rates?.length || 0} rates. This may indicate invalid addresses or test API limitations.`);
      }
      
      // Select rate (lowest by default or specified rateId)
      let selectedRate = shipment.rates[0];
      if (rateId) {
        selectedRate = shipment.rates.find((r: any) => r.id === rateId) || selectedRate;
      }

      // Buy the shipment - pass the rate object directly
      const boughtShipment = await this.client.Shipment.buy(shipmentId, selectedRate);
      
      return {
        tracking_code: boughtShipment.tracking_code,
        label_url: boughtShipment.postage_label?.label_url,
        rate: parseFloat(selectedRate.rate),
        carrier: selectedRate.carrier,
        service: selectedRate.service
      };
    } catch (error: any) {
      throw new Error(`EasyPost buyLabel failed: ${error.message}`);
    }
  }

  async validateAddress(address: any): Promise<any> {
    try {
      const verified = await this.client.Address.createAndVerify(address);
      return verified;
    } catch (error: any) {
      // Return original address with warning if verification fails
      return {
        ...address,
        verifications: {
          delivery: { success: false, errors: [{ message: error.message }] }
        }
      };
    }
  }

  async createCustomsInfo(customsData: any): Promise<any> {
    try {
      const customsInfo = await this.client.CustomsInfo.create({
        customs_certify: true,
        customs_signer: customsData.signer || 'Shipping Clerk',
        contents_type: customsData.contentsType || 'merchandise',
        contents_explanation: customsData.explanation || '',
        eel_pfc: customsData.eelPfc || 'NOEEI 30.37(a)',
        restriction_type: customsData.restrictionType || 'none',
        customs_items: customsData.items
      });

      return customsInfo;
    } catch (error: any) {
      throw new Error(`EasyPost createCustomsInfo failed: ${error.message}`);
    }
  }

  async getShipmentRates(shipmentId: string): Promise<any[]> {
    try {
      const shipment = await this.client.Shipment.retrieve(shipmentId);
      return shipment.rates.map((rate: any) => ({
        id: rate.id,
        carrier: rate.carrier,
        service: rate.service,
        rate: parseFloat(rate.rate),
        currency: rate.currency,
        delivery_days: rate.delivery_days,
        delivery_date: rate.delivery_date
      }));
    } catch (error: any) {
      throw new Error(`EasyPost getShipmentRates failed: ${error.message}`);
    }
  }
}

