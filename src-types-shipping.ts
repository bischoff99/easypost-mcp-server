export interface Address {
  name?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface WeightData {
  fullParcelOz: number;
  reportedWeightOz: number;
  bufferAmount?: number;
  productWeightOz?: number;
}

export interface PackageInfo {
  dimensions: Dimensions;
  weightOz: number;
  fullParcelOz?: number;
  type: 'box' | 'envelope' | 'pak' | 'tube';
  service: string;
  tracking: string;
  insurance: number;
}

export interface ShippingInput {
  recipient: Address;
  sender?: Address;
  weightLbs: number;
  dimensions: Dimensions;
  productDetails: Product[];
  restrictionFlag: boolean;
  serviceLevel?: 'ground' | 'express' | 'priority';
}

export interface Product {
  description: string;
  quantity: number;
  value?: number;
  weightLbs?: number;
  htsCode?: string;
  material?: string;
  countryOfOrigin?: string;
}

export interface CarrierService {
  carrier: 'UPS' | 'FedEx' | 'USPS' | 'DHL';
  service: string;
  rateId: string;
}

export interface ShippingLabel {
  id: string;
  timestamp: string;
  sender: Address;
  recipient: Address;
  package: PackageInfo;
  customs?: CustomsDeclaration;
  metadata: ShippingMetadata;
}

export interface ShippingMetadata {
  serviceProvider: string;
  estimatedCost: number;
  international: boolean;
  validationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FAILED';
  mcpToolsUsed: string[];
  warnings: string[];
  correlationId?: string;
}

export interface CustomsDeclaration {
  formType: 'domestic' | 'CN22' | 'CN23';
  items: CustomsItem[];
  totalValue: number;
  complianceNotes: string;
  contentsType?: 'merchandise' | 'gift' | 'sample' | 'documents';
  restrictionComments?: string;
  eelPfc?: string;
}

export interface CustomsItem {
  description: string;
  htsCode: string;
  quantity: number;
  value: number;
  weightOz: number;
  countryOfOrigin: string;
  declaration?: 'GIFT' | 'PERSONAL USE' | 'MERCHANDISE' | 'SAMPLE';
  material?: string;
  sku?: string;
}

