export type WizardStep = 'supplier' | 'product' | 'review';

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export type DimensionsSource = 'direct' | 'reverse_engineered';

export interface SupplierEntry {
  id: string;
  name: string;
  tel?: string;
  location?: string;
  raw?: string;
  bitrixId?: number;
}

export interface ProductEntry {
  id: string;
  supplierId: string;
  name: string;
  quantity: number;
  unitPriceRmb: number;
  piezasPorCaja: number;
  cbm: number;
  dimensionsSource: DimensionsSource;
  hsCategoryId?: string;
  arancelRate: number;
  ivaRate: number;
}

export interface SessionState {
  trmCopUsd: number;
  cnyToUsd: number;
  ratesFetchedAt: string | null;
  ratesUsedFallback: boolean;
  suppliers: SupplierEntry[];
  products: ProductEntry[];
  activeSupplierIndex: number | null;
  step: WizardStep;
}

export type SessionAction =
  | { type: 'SET_RATES'; payload: { trmCopUsd: number; cnyToUsd: number; fetchedAt: string } }
  | { type: 'SET_RATES_FALLBACK'; payload: Partial<Pick<SessionState, 'trmCopUsd' | 'cnyToUsd'>> }
  | { type: 'ADD_SUPPLIER'; payload: SupplierEntry }
  | { type: 'SET_ACTIVE_SUPPLIER'; payload: number | null }
  | { type: 'ADD_PRODUCT'; payload: ProductEntry }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string } & Partial<ProductEntry> }
  | { type: 'REMOVE_PRODUCT'; payload: { id: string } }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'RESET_SESSION' };
