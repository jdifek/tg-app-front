// src/global.d.ts
export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: any
        enableClosingConfirmation: any
        ready: () => void;
        openInvoice: (url: string, callback: (status: string) => void) => void;
        initDataUnsafe?: any;
        close: () => void;
        showPopup: (params: any) => void;
      };
    };
  }
}
