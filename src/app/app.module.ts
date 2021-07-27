import { LiquidityPoolCache } from './services/cache/liquidity-pool-cache.service';
import { LiquidityPoolService } from './services/liquidity-pool.service';
import { TokenCache } from './services/cache/token-cache.service';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtService } from './services/utility/jwt.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationModule } from './components/navigation-module/navigation.module';
import { TransactionModule } from './components/tx-module/tx.module';
import { ChartsModule } from './components/charts-module/charts.module';
import { TablesModule } from '@sharedComponents/tables-module/tables.module';
import { ModalsModule } from '@sharedComponents/modals-module/modals.module';
import { SharedPipesModule } from './pipes/shared-pipes.module';
import { CardsModule } from '@sharedComponents/cards-module/cards.module';
import { SharedModule } from '@sharedComponents/shared-module/shared.module';


import { PoolsComponent } from './views/pools/pools.component';
import { PoolComponent } from './views/pool/pool.component';
import { MarketComponent } from './views/market/market.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { TokensComponent } from './views/tokens/tokens.component';
import { TokenComponent } from './views/token/token.component';
import { AuthComponent } from './views/auth/auth.component';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WalletComponent } from './views/wallet/wallet.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { GovernanceComponent } from './views/governance/governance.component';
import { VaultComponent } from './views/vault/vault.component';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { jwtOptionsFactory } from '@sharedServices/utility/jwt.service';
import { QRCodeModule } from 'angularx-qrcode';
import { TokenService } from '@sharedServices/token.service';



@NgModule({
  declarations: [
    AppComponent,
    PoolsComponent,
    PoolComponent,
    MarketComponent,
    NotFoundComponent,
    TokensComponent,
    TokenComponent,
    WalletComponent,
    GovernanceComponent,
    VaultComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NavigationModule,
    TransactionModule,
    ChartsModule,
    TablesModule,
    ModalsModule,
    SharedPipesModule,
    CardsModule,
    SharedModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatIconModule,
    MatSidenavModule,
    MatTabsModule,
    ClipboardModule,
    MatChipsModule,
    MatMenuModule,
    LayoutModule,
    MatFormFieldModule,
    MatInputModule,
    QRCodeModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [JwtService]
      }
    })
  ],
  providers: [JwtService, LiquidityPoolService, LiquidityPoolCache],
  bootstrap: [AppComponent]
})
export class AppModule { }
