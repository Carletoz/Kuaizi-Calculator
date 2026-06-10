import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { sessionReducer, initialSessionState } from './reducer';
import type { SessionState, SessionAction } from './types';
import { saveImage, loadAllImages, clearImages } from '@/lib/imageDb';

const SESSION_STORAGE_KEY = 'kuaizi-quote-session';

function loadPersistedState(): SessionState {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return initialSessionState;
    return { ...initialSessionState, ...(JSON.parse(raw) as SessionState) };
  } catch {
    return initialSessionState;
  }
}

interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  imagesReady: boolean;
  setEntityFile: (id: string, file: File) => void;
  getEntityFiles: () => ReadonlyMap<string, File>;
  clearEntityFiles: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, loadPersistedState);
  const filesRef = useRef<Map<string, File>>(new Map());
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    loadAllImages()
      .then((map) => {
        map.forEach((file, id) => filesRef.current.set(id, file));
      })
      .catch(() => {})
      .finally(() => setImagesReady(true));
  }, []);

  const setEntityFile = useCallback((id: string, file: File) => {
    filesRef.current.set(id, file);
    void saveImage(id, file);
  }, []);

  const getEntityFiles = useCallback(() => filesRef.current as ReadonlyMap<string, File>, []);

  const clearEntityFiles = useCallback(() => {
    filesRef.current.clear();
    void clearImages();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage unavailable or full — fail silently
    }
  }, [state]);

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
    <SessionContext.Provider value={{ state, dispatch, imagesReady, setEntityFile, getEntityFiles, clearEntityFiles }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
