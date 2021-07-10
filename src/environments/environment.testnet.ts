import { Network } from "@sharedModels/networks";

const api = 'test-api.opdex.com';

export const environment = {
  production: true,
  defaultTheme: 'dark-mode',
  api: `http://${api}`,
  marketAddress: '',
  allowedJwtDomains: [api],
  network: Network.Testnet
};
