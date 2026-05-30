import type { Currency, FreightMode, Incoterm } from './domain';

export type Mode = 'completo' | 'kuaizi';

export interface DdpInputs {
  cbmTotal: number;
  tarifaDdpCopPerCbm: number;
}

export interface ProductInputs {
  description: string;
  hsCategoryId: string | null;
  hsCodeOverride: string | null;
  unitPrice: number;
  priceCurrency: Currency;
  cnyToUsd: number;       // used only if priceCurrency = 'CNY'
  quantity: number;
  unitWeightKg: number;
  dimensionsCm: { l: number; w: number; h: number };
  incoterm: Incoterm;
  originCity: string;
}

export interface ChinaInputs {
  // All values in USD; ignored if incoterm = 'CIF'
  inlandFreightUsd: number;
  exportCustomsUsd: number;
  coFeeUsd: number;
  inspectionUsd: number;
  sourcingUsd: number;
  packagingUsd: number;
  warehouseUsd: number;
}

export interface FreightFCLInputs {
  containerRateUsd: number;
  surchargesUsd: number;
  docsUsd: number;
}

export interface FreightLCLInputs {
  ratePerWmUsd: number;
  originCfsUsd: number;
  destCfsUsd: number;
  surchargesUsd: number;
  docsUsd: number;
}

export interface FreightAirInputs {
  ratePerKgUsd: number;
  surchargesUsd: number;
  docsUsd: number;
}

export interface FreightExpressInputs {
  quoteUsd: number;
}

export interface FreightInputs {
  mode: FreightMode;
  fcl: FreightFCLInputs;
  lcl: FreightLCLInputs;
  air: FreightAirInputs;
  express: FreightExpressInputs;
  portLoading: string;
  portDestination: string;
  // CIF direct entry (only used when incoterm = 'CIF')
  cifDirectUsd: number;
}

export interface InsuranceInputs {
  enabled: boolean;
  ratePct: number;  // decimal e.g. 0.0035
}

export interface CustomsInputs {
  arancelRate: number;    // decimal
  ivaRate: number;        // decimal (default 0.19)
  antidumping: { enabled: boolean; rate: number };
  vuceCop: number;        // default 39840
  customsAgentUsd: number;
  portThcUsd: number;
  portStorageUsd: number;
  dianInspectionUsd: number;
  invimaIcaUsd: number;
  trm: { value: number; date: string };  // ISO date
}

export interface LocalInputs {
  transportUsd: number;
  insuranceUsd: number;
  warehousingUsd: number;
  destinationCity: string;
}

export interface FinancialInputs {
  bankWireUsd: number;
  financeRatePct: number;
}

export interface KuaiziInputs {
  sourcingUsd: number;
  inspectionUsd: number;
  managementUsd: number;
}

export interface MarginInputs {
  targetPct: number;
}

export interface CalculatorInputs {
  mode: Mode;
  ddp: DdpInputs;
  product: ProductInputs;
  china: ChinaInputs;
  freight: FreightInputs;
  insurance: InsuranceInputs;
  customs: CustomsInputs;
  local: LocalInputs;
  financial: FinancialInputs;
  kuaizi: KuaiziInputs;
  margin: MarginInputs;
}
