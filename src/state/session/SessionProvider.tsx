import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { sessionReducer, initialSessionState } from './reducer';
import type { SessionState, SessionAction } from './types';

interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  setEntityFile: (id: string, file: File) => void;
  getEntityFiles: () => ReadonlyMap<string, File>;
  clearEntityFiles: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const filesRef = useRef<Map<string, File>>(new Map());

  const setEntityFile = useCallback((id: string, file: File) => {
    filesRef.current.set(id, file);
  }, []);

  const getEntityFiles = useCallback(() => filesRef.current as ReadonlyMap<string, File>, []);

  const clearEntityFiles = useCallback(() => {
    filesRef.current.clear();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const { signal } = ctrl;

    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { signal })
      .then((r) => r.json())
      .then((data) => {
        const cop = data?.usd?.cop;
        const cny = data?.usd?.cny;
        if (typeof cop === 'number' && cop > 0 && typeof cny === 'number' && cny > 0) {
          dispatch({
            type: 'SET_RATES',
            payload: { trmCopUsd: Math.round(cop), cnyToUsd: 1 / cny, fetchedAt: new Date().toISOString() },
          });
        } else {
          dispatch({ type: 'SET_RATES_FALLBACK', payload: { trmCopUsd: 4200, cnyToUsd: 0.138 } });
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          dispatch({ type: 'SET_RATES_FALLBACK', payload: { trmCopUsd: 4200, cnyToUsd: 0.138 } });
        }
      });

    return () => ctrl.abort();
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch, setEntityFile, getEntityFiles, clearEntityFiles }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
