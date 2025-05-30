interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (accounts: string[]) => void) => void;
    removeListener: (eventName: string, handler: (accounts: string[]) => void) => void;
  };
} 