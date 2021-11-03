import { TradeComponent } from './views/trade/trade.component';
import { AuthComponent } from './views/auth/auth.component';
import { VaultComponent } from './views/vault/vault.component';
import { GovernanceComponent } from './views/governance/governance.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketComponent } from './views/market/market.component';
import { PoolsComponent } from './views/pools/pools.component';
import { PoolComponent } from './views/pool/pool.component';
import { TokensComponent } from './views/tokens/tokens.component';
import { TokenComponent } from './views/token/token.component';
import { WalletComponent } from './views/wallet/wallet.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: MarketComponent, data: { animation: 'MarketView', title: 'Market'} },
  { path: 'pools', component: PoolsComponent, data: { animation: 'PoolsView', title: 'Liquidity Pools'} },
  { path: 'pools/:pool', component: PoolComponent, data: { animation: 'PoolView', title: 'Liquidity Pool'} },
  { path: 'tokens', component: TokensComponent, data: { animation: 'TokensView', title: 'Tokens'} },
  { path: 'tokens/:token', component: TokenComponent, data: { animation: 'TokenView', title: 'SRC Token'} },
  { path: 'wallet', component: WalletComponent, data: { animation: 'WalletView', title: 'Wallet Summary'} },
  { path: 'governance', component: GovernanceComponent, data: { animation: 'GovernanceView', title: 'Governance'} },
  { path: 'vault', component: VaultComponent, data: { animation: 'VaultView', title: 'Vault'} },
  { path: 'auth', component: AuthComponent, data: { animation: 'AuthView', title: 'Connect'} },
  { path: 'trade', component: TradeComponent, data: { animation: 'TradeView', title: 'Trade'} },
  { path: '**', component: NotFoundComponent, data: { animation: 'NotFoundView', title: 'Page Not Found'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
