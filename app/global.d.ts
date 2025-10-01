// src/global.d.ts
export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        close: () => void;
        initData?: string;
        initDataUnsafe?: any;
        expand?: () => void;
        ready?: () => void;
        [key: string]: any;
      };
    };
  }
}
