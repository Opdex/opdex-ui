import { Network } from 'src/app/enums/networks';

// const api = 'http://localhost:44391/v1';
const api = 'https://v1-test-api.opdex.com/v1';

export const environment = {
  production: false,
  ga: '',
  apiOverride: api,
  networkOverride: Network.Testnet,
  defaultTheme: 'light-mode'
};
