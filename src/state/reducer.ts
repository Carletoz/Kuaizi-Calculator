import type {
  CalculatorInputs,
  ChinaInputs,
  CustomsInputs,
  DdpInputs,
  FinancialInputs,
  FreightAirInputs,
  FreightExpressInputs,
  FreightFCLInputs,
  FreightInputs,
  FreightLCLInputs,
  InsuranceInputs,
  KuaiziInputs,
  LocalInputs,
  MarginInputs,
  Mode,
  ProductInputs,
} from '@/types/inputs';
import type { Currency, FreightMode, Incoterm } from '@/types/domain';
import { DEFAULT_INSURANCE_RATE, DEFAULT_IVA_RATE, DEFAULT_VUCE_COP } from '@/lib/calc/defaults';

// CalculatorState mirrors CalculatorInputs exactly
export type CalculatorState = CalculatorInputs;

// ── Actions ──────────────────────────────────────────────────────────────────

export type Action =
  // Mode
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SET_DDP'; payload: Partial<DdpInputs> }
  // Product section
  | { type: 'SET_PRODUCT'; payload: Partial<ProductInputs> }
  | { type: 'SET_INCOTERM'; payload: Incoterm }
  | { type: 'SET_HS_CATEGORY'; payload: { id: string; arancelRate: number; ivaRate: number } }
  // China section
  | { type: 'SET_CHINA'; payload: Partial<ChinaInputs> }
  // Freight section
  | { type: 'SET_FREIGHT_MODE'; payload: FreightMode }
  | { type: 'SET_FREIGHT'; payload: Partial<FreightInputs> }
  | { type: 'SET_FREIGHT_FCL'; payload: Partial<FreightFCLInputs> }
  | { type: 'SET_FREIGHT_LCL'; payload: Partial<FreightLCLInputs> }
  | { type: 'SET_FREIGHT_AIR'; payload: Partial<FreightAirInputs> }
  | { type: 'SET_FREIGHT_EXPRESS'; payload: Partial<FreightExpressInputs> }
  // Insurance section
  | { type: 'SET_INSURANCE_ENABLED'; payload: boolean }
  | { type: 'SET_INSURANCE'; payload: Partial<InsuranceInputs> }
  // Customs section
  | { type: 'SET_CUSTOMS'; payload: Partial<CustomsInputs> }
  | { type: 'SET_ANTIDUMPING_ENABLED'; payload: boolean }
  | { type: 'SET_TRM'; payload: { value: number; date: string } }
  // Local section
  | { type: 'SET_LOCAL'; payload: Partial<LocalInputs> }
  // Financial section
  | { type: 'SET_FINANCIAL'; payload: Partial<FinancialInputs> }
  // Kuaizi section
  | { type: 'SET_KUAIZI'; payload: Partial<KuaiziInputs> }
  // Margin section
  | { type: 'SET_MARGIN'; payload: Partial<MarginInputs> }
  // Currency toggle
  | { type: 'SET_PRICE_CURRENCY'; payload: Currency };

// ── Initial state ─────────────────────────────────────────────────────────────

export const initialState: CalculatorState = {
  mode: 'cliente',
  ddp: {
    cbmTotal: 0,
    tarifaDdpCopPerCbm: 0,
  },
  product: {
    description: '',
    hsCategoryId: null,
    hsCodeOverride: null,
    unitPrice: 0,
    priceCurrency: 'USD',
    cnyToUsd: 0,
    quantity: 0,
    unitWeightKg: 0,
    dimensionsCm: { l: 0, w: 0, h: 0 },
    incoterm: 'EXW',
    originCity: '',
  },
  china: {
    inlandFreightUsd: 0,
    exportCustomsUsd: 0,
    coFeeUsd: 0,
    inspectionUsd: 0,
    sourcingUsd: 0,
    packagingUsd: 0,
    warehouseUsd: 0,
  },
  freight: {
    mode: 'SEA_LCL',
    fcl: { containerRateUsd: 0, surchargesUsd: 0, docsUsd: 0 },
    lcl: { ratePerWmUsd: 0, originCfsUsd: 0, destCfsUsd: 0, surchargesUsd: 0, docsUsd: 0 },
    air: { ratePerKgUsd: 0, surchargesUsd: 0, docsUsd: 0 },
    express: { quoteUsd: 0 },
    portLoading: '',
    portDestination: '',
    cifDirectUsd: 0,
  },
  insurance: {
    enabled: false,
    ratePct: DEFAULT_INSURANCE_RATE,
  },
  customs: {
    arancelRate: 0,
    ivaRate: DEFAULT_IVA_RATE,
    antidumping: { enabled: false, rate: 0 },
    vuceCop: DEFAULT_VUCE_COP,
    customsAgentUsd: 0,
    portThcUsd: 0,
    portStorageUsd: 0,
    dianInspectionUsd: 0,
    invimaIcaUsd: 0,
    trm: { value: 0, date: '' },
  },
  local: {
    transportUsd: 0,
    insuranceUsd: 0,
    warehousingUsd: 0,
    destinationCity: '',
  },
  financial: {
    bankWireUsd: 0,
    financeRatePct: 0,
  },
  kuaizi: {
    sourcingUsd: 0,
    inspectionUsd: 0,
    managementUsd: 0,
  },
  margin: {
    targetPct: 0,
  },
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        ddp: { cbmTotal: 0, tarifaDdpCopPerCbm: 0 },
      };

    case 'SET_DDP':
      return { ...state, ddp: { ...state.ddp, ...action.payload } };

    case 'SET_PRODUCT':
      return { ...state, product: { ...state.product, ...action.payload } };

    case 'SET_INCOTERM':
      return { ...state, product: { ...state.product, incoterm: action.payload } };

    case 'SET_PRICE_CURRENCY':
      return {
        ...state,
        product: { ...state.product, priceCurrency: action.payload },
      };

    case 'SET_HS_CATEGORY':
      return {
        ...state,
        product: {
          ...state.product,
          hsCategoryId: action.payload.id,
        },
        customs: {
          ...state.customs,
          arancelRate: action.payload.arancelRate,
          ivaRate: action.payload.ivaRate,
        },
      };

    case 'SET_CHINA':
      return { ...state, china: { ...state.china, ...action.payload } };

    case 'SET_FREIGHT_MODE':
      // Switching modes resets sub-form fields to 0 — do NOT preserve stale data
      return {
        ...state,
        freight: {
          ...state.freight,
          mode: action.payload,
          fcl: { containerRateUsd: 0, surchargesUsd: 0, docsUsd: 0 },
          lcl: { ratePerWmUsd: 0, originCfsUsd: 0, destCfsUsd: 0, surchargesUsd: 0, docsUsd: 0 },
          air: { ratePerKgUsd: 0, surchargesUsd: 0, docsUsd: 0 },
          express: { quoteUsd: 0 },
        },
      };

    case 'SET_FREIGHT':
      return { ...state, freight: { ...state.freight, ...action.payload } };

    case 'SET_FREIGHT_FCL':
      return {
        ...state,
        freight: { ...state.freight, fcl: { ...state.freight.fcl, ...action.payload } },
      };

    case 'SET_FREIGHT_LCL':
      return {
        ...state,
        freight: { ...state.freight, lcl: { ...state.freight.lcl, ...action.payload } },
      };

    case 'SET_FREIGHT_AIR':
      return {
        ...state,
        freight: { ...state.freight, air: { ...state.freight.air, ...action.payload } },
      };

    case 'SET_FREIGHT_EXPRESS':
      return {
        ...state,
        freight: { ...state.freight, express: { ...state.freight.express, ...action.payload } },
      };

    case 'SET_INSURANCE_ENABLED':
      return {
        ...state,
        insurance: { ...state.insurance, enabled: action.payload },
      };

    case 'SET_INSURANCE':
      return { ...state, insurance: { ...state.insurance, ...action.payload } };

    case 'SET_CUSTOMS':
      return { ...state, customs: { ...state.customs, ...action.payload } };

    case 'SET_ANTIDUMPING_ENABLED':
      return {
        ...state,
        customs: {
          ...state.customs,
          antidumping: { ...state.customs.antidumping, enabled: action.payload },
        },
      };

    case 'SET_TRM':
      return {
        ...state,
        customs: { ...state.customs, trm: action.payload },
      };

    case 'SET_LOCAL':
      return { ...state, local: { ...state.local, ...action.payload } };

    case 'SET_FINANCIAL':
      return { ...state, financial: { ...state.financial, ...action.payload } };

    case 'SET_KUAIZI':
      return { ...state, kuaizi: { ...state.kuaizi, ...action.payload } };

    case 'SET_MARGIN':
      return { ...state, margin: { ...state.margin, ...action.payload } };

    default:
      return state;
  }
}
