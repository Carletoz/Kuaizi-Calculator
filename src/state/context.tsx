import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { initialState, reducer } from './reducer';
import type { Action, CalculatorState } from './reducer';
import { selectInputs } from './selectors';
import { calculateLandedCost } from '@/lib/calc/index';
import type { CalculatorResult } from '@/types/result';

interface CalculatorContextValue {
  state: CalculatorState;
  dispatch: React.Dispatch<Action>;
  result: CalculatorResult;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Recalculation triggered on every state change — synchronous, race-free.
  // O(constant) computation, no side effects in this memoized path.
  const result = useMemo(() => {
    const inputs = selectInputs(state);
    return calculateLandedCost(inputs);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, result }), [state, dispatch, result]);

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return ctx;
}
