import { SidenavService } from '@sharedServices/utility/sidenav.service';
import { ThemeService } from '@sharedServices/utility/theme.service';
import { FixedDecimal } from '@sharedModels/types/fixed-decimal';
import { MathService } from '@sharedServices/utility/math.service';
import { IAddressBalance } from '@sharedModels/platform-api/responses/wallets/address-balance.interface';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { IAddressMining } from '@sharedModels/platform-api/responses/wallets/address-mining.interface';
import { Router } from '@angular/router';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { UserContextService } from '@sharedServices/utility/user-context.service';
import { ITransactionsRequest } from '@sharedModels/platform-api/requests/transactions/transactions-filter';
import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, take, tap, catchError } from 'rxjs/operators';
import { IToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { IAddressStaking } from '@sharedModels/platform-api/responses/wallets/address-staking.interface';
import { WalletsService } from '@sharedServices/platform/wallets.service';
import { Icons } from 'src/app/enums/icons';
import { IconSizes } from 'src/app/enums/icon-sizes';
import { TransactionView } from '@sharedModels/transaction-view';
import { CollapseAnimation } from '@sharedServices/animations/collapse';

@Component({
  selector: 'opdex-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  animations: [CollapseAnimation]
})
export class WalletComponent implements OnInit {
  transactionsRequest: ITransactionsRequest;
  walletProvisions: any;
  walletBalances: any;
  miningPositions: any;
  stakingPositions: any;
  wallet: any;
  crsBalance: IAddressBalance;
  crsBalanceValue: string;
  showPreferences: boolean;
  block = 1;
  icons = Icons;
  iconSizes = IconSizes;

  constructor(
    private _context: UserContextService,
    private _tokensService: TokensService,
    private _liquidityPoolService: LiquidityPoolsService,
    private _walletsService: WalletsService,
    private _router: Router,
    private _theme: ThemeService,
    private _sidebar: SidenavService
  ) {
    this.wallet = this._context.getUserContext();

    if (!this.wallet || !this.wallet.wallet) {
      this._router.navigateByUrl('/auth');
    }

    this.transactionsRequest = {
      limit: 15,
      direction: "DESC",
      eventTypes: [],
      wallet: this.wallet.wallet
    };
  }

  ngOnInit(): void {
    this.getWalletBalances(5);
    this.getMiningPositions(5);
    this.getStakingPositions(5);
    this.getProvisionalPositions(5);

    this._walletsService.getBalance(this.wallet.wallet, 'CRS')
      .pipe(
        tap(crsBalance => this.crsBalance = crsBalance),
        switchMap(crsBalance => this._tokensService.getMarketToken(crsBalance.token)),
        tap((token: IToken) => {
          const costFixed = new FixedDecimal(token.summary.priceUsd.toString(), 8);
          const crsBalanceFixed = new FixedDecimal(this.crsBalance.balance, 8);
          this.crsBalanceValue = MathService.multiply(crsBalanceFixed, costFixed);
        }),
        take(1)).subscribe();
  }

  handleDeadlineChange(threshold: number) {
    this.wallet.preferences.deadlineThreshold = threshold;
    this._context.setUserPreferences(this.wallet.wallet, this.wallet.preferences);
  }

  handleToleranceChange(threshold: number) {
    this.wallet.preferences.toleranceThreshold = threshold;
    this._context.setUserPreferences(this.wallet.wallet, this.wallet.preferences);
  }

  toggleTheme(theme: string) {
    this.wallet.preferences.theme = theme;
    this._context.setUserPreferences(this.wallet.wallet, this.wallet.preferences);
    this._theme.setTheme(theme);
  }

  togglePreferences() {
    this.showPreferences = !this.showPreferences;
  }

  handleBalancesPageChange(cursor: string) {
    this.getWalletBalances(null, cursor);
  }

  handleMiningPositionsPageChange(cursor: string) {
    this.getMiningPositions(null, cursor);
  }

  handleStakingPositionsPageChange(cursor: string) {
    this.getStakingPositions(null, cursor);
  }

  handleProvisionalPositionsPageChange(cursor: string) {
    this.getProvisionalPositions(null, cursor);
  }

  private getMiningPositions(limit?: number, cursor?: string) {
    this._walletsService.getMiningPositions(this.wallet.wallet, limit, cursor)
      .pipe(
        switchMap(response => {
          if (response.results.length === 0) return of(response);

          const positions$: Observable<IAddressMining>[] = [];

          response.results.forEach(position => {
            const miningPositionDetails$: Observable<any> =
              this._liquidityPoolService.getLiquidityPool(position.miningToken)
                .pipe(take(1), map(pool => { return { pool, position } }));

            positions$.push(miningPositionDetails$);
          })

          return forkJoin(positions$).pipe(map(positions => { return { paging: response.paging, positions } }));
        }),
        take(1)
      ).subscribe(response => this.miningPositions = response);
  }

  private getStakingPositions(limit?: number, cursor?: string) {
    this._walletsService.getStakingPositions(this.wallet.wallet, limit, cursor)
      .pipe(
        switchMap(response => {
          if (response.results.length === 0) return of(response);

          const positions$: Observable<IAddressStaking>[] = [];

          response.results.forEach(position => {
            const stakingPositionDetails$: Observable<any> =
              this._liquidityPoolService.getLiquidityPool(position.liquidityPool)
                .pipe(
                  take(1),
                  map(pool => { return { pool, position }; }));

            positions$.push(stakingPositionDetails$);
          })

          return forkJoin(positions$).pipe(map(positions => {
            return { paging: response.paging, positions }
          }));
        }),
        take(1)
      ).subscribe(response => this.stakingPositions = response);
  }

  private getWalletBalances(limit?: number, cursor?: string) {
    this._walletsService.getWalletBalances(this.wallet.wallet, 'NonProvisional', limit, cursor)
      .pipe(
        switchMap(response => {
          if (response.results.length === 0) return of(response);

          const balances$: Observable<IToken>[] = [];

          response.results.forEach(balance => {
            const tokenDetails$: Observable<IToken> =
              this._tokensService.getMarketToken(balance.token)
                .pipe(
                  // Fallback to tokens when necessary
                  // Todo: Backend really should return average token prices
                  catchError(_ => this._tokensService.getToken(balance.token)),
                  take(1),
                  map(token => {
                    token.balance = balance;
                    return token;
                  })
                );

            balances$.push(tokenDetails$);
          })

          return forkJoin(balances$).pipe(map(balances => {
            return { paging: response.paging, balances }
          }));
        }),
        take(1)
      ).subscribe(response => this.walletBalances = response);
  }

  private getProvisionalPositions(limit?: number, cursor?: string) {
    this._walletsService.getWalletBalances(this.wallet.wallet, 'Provisional', limit, cursor)
      .pipe(
        switchMap(response => {
          if (response.results.length === 0) return of(response);

          const balances$: Observable<IToken>[] = [];

          response.results.forEach(balance => {
            const poolDetail$: Observable<IToken> =
              this._liquidityPoolService.getLiquidityPool(balance.token)
                .pipe(
                  take(1),
                  map(pool => {
                    let token = pool.token.lp;
                    token.name = pool.name
                    token.balance = balance;
                    return token;
                  })
                );

            balances$.push(poolDetail$);
          })

          return forkJoin(balances$).pipe(map(balances => {
            return { paging: response.paging, balances }
          }));
        }),
        take(1)
      ).subscribe(response => this.walletProvisions = response);
  }

  handleTxOption($event: TransactionView) {
    this._sidebar.openSidenav($event);
  }
}
