import type { SessionState, SessionAction } from './types';

export const initialSessionState: SessionState = {
  trmCopUsd: 4200,
  cnyToUsd: 0.138,
  ratesFetchedAt: null,
  ratesUsedFallback: true,
  suppliers: [],
  products: [],
  activeSupplierIndex: null,
  step: 'supplier',
};

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_RATES':
      return {
        ...state,
        trmCopUsd: action.payload.trmCopUsd,
        cnyToUsd: action.payload.cnyToUsd,
        ratesFetchedAt: action.payload.fetchedAt,
        ratesUsedFallback: false,
      };

    case 'SET_RATES_FALLBACK':
      return {
        ...state,
        trmCopUsd: action.payload.trmCopUsd ?? state.trmCopUsd,
        cnyToUsd: action.payload.cnyToUsd ?? state.cnyToUsd,
        ratesUsedFallback: true,
      };

    case 'ADD_SUPPLIER': {
      const suppliers = [...state.suppliers, action.payload];
      return {
        ...state,
        suppliers,
        activeSupplierIndex: suppliers.length - 1,
      };
    }

    case 'SET_ACTIVE_SUPPLIER':
      return { ...state, activeSupplierIndex: action.payload };

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p,
        ),
      };

    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload.id),
      };

    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'RESET_SESSION':
      return {
        ...initialSessionState,
        trmCopUsd: state.trmCopUsd,
        cnyToUsd: state.cnyToUsd,
        ratesFetchedAt: state.ratesFetchedAt,
        ratesUsedFallback: state.ratesUsedFallback,
      };

    default:
      return state;
  }
}
