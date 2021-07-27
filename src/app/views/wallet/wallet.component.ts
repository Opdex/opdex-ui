import { TokenService } from '@sharedServices/token.service';
import { PlatformApiService } from '@sharedServices/api/platform-api.service';
import { UserContextService } from '@sharedServices/user-context.service';
import { ITransactionsRequest } from '@sharedModels/requests/transactions-filter';
import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { IToken } from '@sharedModels/responses/platform-api/token.interface';

@Component({
  selector: 'opdex-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  transactionsRequest: ITransactionsRequest;
  walletBalances$: Observable<any[]>;
  wallet: string;

  constructor(
    private _context: UserContextService,
    private _platform: PlatformApiService,
    private _tokenService: TokenService
  ) {
    this.wallet = this._context.getUserContext().wallet;
    this.walletBalances$ = this._platform.getWalletBalances(this.wallet)
      .pipe(
        switchMap(response => {
          const balances$: Observable<IToken>[] = [];

          response.balances.forEach(balance => {
            const tokenDetails$: Observable<IToken> =
              this._tokenService.getToken(balance.token)
                .pipe(
                  take(1),
                  map(token => {
                    token.balance = balance;
                    return token;
                  })
                );

            balances$.push(tokenDetails$);
          })

          return forkJoin(balances$);
        })
      )
  }

  ngOnInit(): void {
    this.transactionsRequest = {
      limit: 10,
      direction: "DESC",
      eventTypes: [],
      wallet: this.wallet
    };
  }
}
