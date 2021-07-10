import { SidenavService } from '@sharedServices/sidenav.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '@environments/environment';
import { TxBase } from '@sharedComponents/tx-module/tx-swap/tx-base.component';
import { ILiquidityPoolSummaryResponse, IToken } from '@sharedModels/responses/platform-api/Pools/liquidity-pool.interface';
import { PlatformApiService } from '@sharedServices/api/platform-api.service';
import { UserContextService } from '@sharedServices/user-context.service';
import { Observable, throwError } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take, tap, catchError } from 'rxjs/operators';
import { TransactionView } from '@sharedModels/transaction-view';
import { of } from 'rxjs';

@Component({
  selector: 'opdex-tx-provide-add',
  templateUrl: './tx-provide-add.component.html',
  styleUrls: ['./tx-provide-add.component.scss']
})
export class TxProvideAddComponent extends TxBase implements OnInit {
  @Input() pool: ILiquidityPoolSummaryResponse;
  txHash: string;
  subscription = new Subscription();
  allowance: any;

  form: FormGroup;

  get amountCrs(): FormControl {
    return this.form.get('amountCrs') as FormControl;
  }

  get amountSrc(): FormControl {
    return this.form.get('amountSrc') as FormControl;
  }

  constructor(
    private _fb: FormBuilder,
    protected _dialog: MatDialog,
    private _platformApi: PlatformApiService,
    protected _userContext: UserContextService
  ) {
    super(_userContext, _dialog);

    this.form = this._fb.group({
      amountCrs: ['', [Validators.required]],
      amountSrc: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.amountCrs.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(amount => this.quote$(amount, this.pool?.token?.crs)),
          switchMap(amount => this.getAllowance$(amount))
        )
        .subscribe(allowance => {
          if (allowance.amount > 0) {
            this.amountSrc.setValue(allowance.amount, { emitEvent: false })
          }
        }));

    this.subscription.add(
      this.amountSrc.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(amount => this.quote$(amount, this.pool?.token?.src)),
          switchMap(amount => this.getAllowance$(amount))
        )
        .subscribe(allowance => {
          if (allowance.amount > 0) {
            this.amountCrs.setValue(allowance.amount, { emitEvent: false })
          }
        }));
  }

  getAllowance$(amount: string):Observable<any> {
    // Todo: shouldn't be hard coded
    const router = 'PHh7jEgXCjrd48CNhN4UgYE5WeyERrpFYr';
    const token = this.pool?.token?.src?.address;

    return this._platformApi.getApprovedAllowance(this.context.wallet, router, token)
      .pipe(
        map(allowances => {
          // todo: set;
          return { spender: router, token, amount, allowances, valueApproved: parseFloat(amount) <= parseFloat(allowances[0]?.allowance) }
        }),
        tap(rsp => {
          this.allowance = rsp;
          console.log(rsp);
        })
      );
  }

  quote$(value: string, tokenIn: IToken): Observable<string> {
    if (!tokenIn) {
      throwError('Invalid token');
    }

    const payload = {
      amountIn: parseFloat(value).toFixed(tokenIn.decimals),
      tokenIn: tokenIn.address,
      pool: this.pool.address
    };

    return this._platformApi.quoteAddLiquidity(payload).pipe(catchError(() => of('0.00')));
  }

  submit(): void {
    const payload = {
      amountCrs: parseFloat(this.amountCrs.value).toFixed(8),
      amountSrc: parseFloat(this.amountSrc.value).toFixed(this.pool.token.src.decimals),
      tolerance: .001,
      recipient: this.context.wallet,
      liquidityPool: this.pool.address
    }

    this.signTx(payload, 'add-liquidity');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
