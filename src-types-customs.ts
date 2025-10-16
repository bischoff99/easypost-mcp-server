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

export interface CustomsDeclaration {
  formType: 'domestic' | 'CN22' | 'CN23';
  items: CustomsItem[];
  totalValue: number;
  complianceNotes: string;
  contentsType?: 'merchandise' | 'gift' | 'sample' | 'documents';
  restrictionComments?: string;
  eelPfc?: string;
}

export interface HTSCodeInfo {
  code: string;
  description: string;
  dutyRate?: number;
  category: string;
}

