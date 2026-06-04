/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_N8N_SUPPLIER_WEBHOOK_URL: string;
  readonly VITE_N8N_PRODUCT_WEBHOOK_URL: string;
  readonly VITE_N8N_SHARE_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

