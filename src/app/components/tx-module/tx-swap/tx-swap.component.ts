import { IToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { IAddressAllowanceResponse } from '@sharedModels/platform-api/responses/wallets/address-allowance.interface';
import { TokenOrderByTypes, TokensFilter } from '@sharedModels/platform-api/requests/tokens/tokens-filter';
import { EnvironmentsService } from '@sharedServices/utility/environments.service';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { ISwapAmountInQuoteResponse } from '@sharedModels/platform-api/responses/tokens/swap-amount-in-quote-response.interface';
import { BlocksService } from '@sharedServices/platform/blocks.service';
import { FixedDecimal } from '@sharedModels/types/fixed-decimal';
import { MathService } from '@sharedServices/utility/math.service';
import { PlatformApiService } from '@sharedServices/api/platform-api.service';
import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, of, Observable } from 'rxjs';
import { debounceTime, take, distinctUntilChanged, switchMap, map, tap, catchError, filter } from 'rxjs/operators';
import { AllowanceValidation } from '@sharedModels/allowance-validation';
import { Icons } from 'src/app/enums/icons';
import { AllowanceRequiredTransactionTypes } from 'src/app/enums/allowance-required-transaction-types';
import { DecimalStringRegex } from '@sharedLookups/regex';
import { ITransactionQuote } from '@sharedModels/platform-api/responses/transactions/transaction-quote.interface';
import { TxBase } from '../tx-base.component';
import { IMarketToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { ISwapRequest, SwapRequest } from '@sharedModels/platform-api/requests/tokens/swap-request';
import { SwapAmountInQuoteRequest } from '@sharedModels/platform-api/requests/tokens/swap-amount-in-quote-request';
import { SwapAmountOutQuoteRequest } from '@sharedModels/platform-api/requests/tokens/swap-amount-out-quote-request';
import { ISwapAmountOutQuoteResponse } from '@sharedModels/platform-api/responses/tokens/swap-amount-out-quote-response.interface';
import { IconSizes } from 'src/app/enums/icon-sizes';
import { CollapseAnimation } from '@sharedServices/animations/collapse';

@Component({
  selector: 'opdex-tx-swap',
  templateUrl: './tx-swap.component.html',
  styleUrls: ['./tx-swap.component.scss'],
  animations: [CollapseAnimation]
})
export class TxSwapComponent extends TxBase implements OnDestroy {
  @Input() data: any;
  icons = Icons;
  iconSizes = IconSizes;
  tokenInExact = true;
  form: FormGroup;
  tokenIn: IMarketToken;
  tokenInMax: string;
  tokenInFiatValue: string;
  tokenInMaxFiatValue: string;
  tokenInPercentageSelected: string;
  changeTokenIn: boolean;
  tokenOut: IMarketToken;
  tokenOutMin: string;
  tokenOutFiatValue: string;
  tokenOutMinFiatValue: string;
  tokenOutPercentageSelected: string;
  changeTokenOut: boolean;
  toleranceThreshold: number;
  deadlineThreshold: number;
  allowance: AllowanceValidation;
  transactionTypes = AllowanceRequiredTransactionTypes;
  showMore: boolean;
  latestBlock: number;
  subscription = new Subscription();

  get tokenInAmount(): FormControl {
    return this.form.get('tokenInAmount') as FormControl;
  }

  get tokenOutAmount(): FormControl {
    return this.form.get('tokenOutAmount') as FormControl;
  }

  constructor(
    private _fb: FormBuilder,
    private _platformApi: PlatformApiService,
    private _blocksService: BlocksService,
    private _tokensService: TokensService,
    private _env: EnvironmentsService,
    protected _injector: Injector
  ) {
    super(_injector);

    this.deadlineThreshold = this.context?.preferences?.deadlineThreshold || 10;
    this.toleranceThreshold = this.context?.preferences?.toleranceThreshold || 0.1;

    this.form = this._fb.group({
      tokenInAmount: ['', [Validators.required, Validators.pattern(DecimalStringRegex)]],
      tokenOutAmount: ['', [Validators.required, Validators.pattern(DecimalStringRegex)]],
    });

    this.subscription.add(
      this.tokenInAmount.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          tap(_ => this.tokenInExact = true),
          switchMap((value: string) => this.amountOutQuote(value))
        ).subscribe());

    this.subscription.add(
      this.tokenOutAmount.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          tap(_ => this.tokenInExact = false),
          switchMap((value: string) => this.amountInQuote(value))
        ).subscribe());

    this.subscription.add(
      this._blocksService.getLatestBlock$()
        .pipe(
          tap(block => this.latestBlock = block?.height),
          tap(_ => this.refreshToken(this.tokenIn?.address)),
          tap(_ => this.refreshToken(this.tokenOut?.address)),
          switchMap(_ => this.validateAllowance()))
        .subscribe());
  }

  ngOnChanges() {
    if (this.data?.pool) {
      this.tokenIn = this.data.pool.token.crs;
      this.tokenOut = this.data.pool.token.src;
    } else {
      const topTokens = new TokensFilter({limit: 2, direction: 'DESC', orderBy: TokenOrderByTypes.DailyPriceChangePercent});
      this._tokensService.getTokens(topTokens)
        .pipe(take(1))
        .subscribe(response => {
          if (response?.results?.length >= 2) {
            this.tokenIn = response.results[0] as IMarketToken;
            this.tokenOut = response.results[1] as IMarketToken;
          }
        });
    }
  }

  selectToken(tokenField: string, token: IToken): void {
    const isTokenInField = tokenField === 'tokenIn';

    if (isTokenInField) {
      this.changeTokenIn = false;
      this.tokenInPercentageSelected = null;
    } else {
      this.changeTokenOut = false;
      this.tokenOutPercentageSelected = null;
    }

    if (token !== null && token !== undefined) {
      if (isTokenInField) this.tokenIn = token as IMarketToken;
      else this.tokenOut = token as IMarketToken;

      this.tokenInExact
        ? this.amountOutQuote(this.tokenInAmount.value).pipe(take(1)).subscribe()
        : this.amountInQuote(this.tokenOutAmount.value).pipe(take(1)).subscribe();
    }
  }

  changeToken(tokenField: string): void {
    if (tokenField === 'tokenIn') this.changeTokenIn = true;
    else this.changeTokenOut = true;
  }

  submit() {
    const payload: ISwapRequest = new SwapRequest({
      tokenOut: this.tokenOut.address,
      tokenInAmount: this.tokenInAmount.value,
      tokenOutAmount: this.tokenOutAmount.value,
      tokenInExactAmount: this.tokenInExact,
      recipient: this.context.wallet,
      tokenInMaximumAmount: this.tokenInMax,
      tokenOutMinimumAmount: this.tokenOutMin,
      deadline: this.calcDeadline(this.deadlineThreshold)
    });

    if(payload.isValid){
      this._platformApi
        .swapQuote(this.tokenIn.address, payload)
          .pipe(take(1))
          .subscribe((quote: ITransactionQuote) => this.quote(quote));
    }
  }

  switch() {
    const tokenInAmount = this.tokenInAmount.value;
    const tokenOutAmount = this.tokenOutAmount.value;
    const tokenIn = this.tokenIn;
    const tokenOut = this.tokenOut;
    const tokenInPercentageSelection = this.tokenInPercentageSelected;
    const tokenOutPercentageSelection = this.tokenOutPercentageSelected;

    this.tokenIn = tokenOut;
    this.tokenOut = tokenIn;
    this.tokenOutPercentageSelected = tokenInPercentageSelection;
    this.tokenInPercentageSelected = tokenOutPercentageSelection;

    if (this.tokenInExact) {
      this.tokenInExact = false;
      this.tokenOutAmount.setValue(tokenInAmount, { emitEvent: false });
      this.amountInQuote(tokenInAmount).pipe(take(1)).subscribe();
    } else {
      this.tokenInExact = true;
      this.tokenInAmount.setValue(tokenOutAmount, { emitEvent: false });
      this.amountOutQuote(tokenOutAmount).pipe(take(1)).subscribe();
    }
  }

  calcTotals(tolerance?: number): void {
    if (tolerance) this.toleranceThreshold = tolerance;
    if (this.toleranceThreshold > 99.99 || this.toleranceThreshold < .01) return;
    if (!this.tokenInAmount.value || !this.tokenInAmount.value) return;

    const tokenInDecimals = this.tokenIn.decimals;
    const tokenOutDecimals = this.tokenOut.decimals;
    const tokenInAmount = new FixedDecimal(this.tokenInAmount.value, tokenInDecimals);
    const tokenInPrice = new FixedDecimal(this.tokenIn.summary.priceUsd.toString(), 8);
    const tokenInTolerance = new FixedDecimal((1 + (this.toleranceThreshold / 100)).toFixed(8), 8);
    const tokenOutAmount = new FixedDecimal(this.tokenOutAmount.value, tokenOutDecimals);
    const tokenOutPrice = new FixedDecimal(this.tokenOut.summary.priceUsd.toString(), 8);
    const tokenOutTolerancePercentage = new FixedDecimal((this.toleranceThreshold / 100).toFixed(8), 8);
    const tokenOutToleranceAmount = MathService.multiply(tokenOutAmount, tokenOutTolerancePercentage);
    const tokenOutTolerance = new FixedDecimal(tokenOutToleranceAmount, tokenOutDecimals);

    this.tokenInMax = MathService.multiply(tokenInAmount, tokenInTolerance);
    this.tokenOutMin = MathService.subtract(tokenOutAmount, tokenOutTolerance);
    this.tokenInFiatValue = MathService.multiply(tokenInAmount, tokenInPrice);
    this.tokenOutFiatValue = MathService.multiply(tokenOutAmount, tokenOutPrice);

    const tokenInMax = new FixedDecimal(this.tokenInMax, tokenInDecimals);
    const tokenOutMin = new FixedDecimal(this.tokenOutMin, tokenOutDecimals);

    this.tokenInMaxFiatValue = MathService.multiply(tokenInMax, tokenInPrice);
    this.tokenOutMinFiatValue = MathService.multiply(tokenOutMin, tokenOutPrice);
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }

  calcDeadline(minutes: number): number {
    this.deadlineThreshold = minutes;
    const blocks = Math.ceil(60 * minutes / 16);
    return blocks + this.latestBlock;
  }

  handlePercentageSelect(field: string, value: any): void {
    if (field === 'amountIn') {
      this.tokenOutPercentageSelected = null;
      this.tokenInPercentageSelected = value.percentageOption;
      this.tokenInAmount.setValue(value.result, {emitEvent: true});
    } else {
      this.tokenOutPercentageSelected = value.percentageOption;
      this.tokenInPercentageSelected = null;
      this.tokenOutAmount.setValue(value.result, {emitEvent: true});
    }
  }

  private resetValues() {
    this.tokenInAmount.setValue('', { emitEvent: false });
    this.tokenOutAmount.setValue('', { emitEvent: false });
    this.tokenInMax = null;
    this.tokenInFiatValue = null;
    this.tokenInMaxFiatValue = null;
    this.tokenOutMin = null;
    this.tokenOutFiatValue = null;
    this.tokenOutMinFiatValue = null;
  }

  private amountInQuote(amountOut: string): Observable<boolean> {
    if (!this.tokenIn || !this.tokenOut) return of(false);

    const amountOutFixed = new FixedDecimal(amountOut, this.tokenOut.decimals);

    if (amountOutFixed.isZero) {
      this.resetValues();
      return of(false);
    }

    const payload = new SwapAmountInQuoteRequest(this.tokenOut.address, amountOutFixed.formattedValue);

    return this._platformApi
      .swapAmountInQuote(this.tokenIn.address, payload)
      .pipe(
        catchError(() => of()),
        filter(quote => quote !== null && quote !== undefined),
        tap((value: ISwapAmountInQuoteResponse) => this.tokenInAmount.setValue(value.amountIn, { emitEvent: false })),
        tap(_ => this.calcTotals()),
        filter(_ => this.context.wallet !== undefined),
        switchMap(() => this.validateAllowance()));
  }

  private amountOutQuote(amountIn: string): Observable<boolean> {
    if (!this.tokenIn || !this.tokenOut) return of(false);

    const amountInFixed = new FixedDecimal(amountIn, this.tokenIn.decimals);

    if (amountInFixed.isZero) {
      this.resetValues();
      return of(false);
    }

    const payload = new SwapAmountOutQuoteRequest(this.tokenIn.address, amountInFixed.formattedValue);

    return this._platformApi.swapAmountOutQuote(this.tokenOut.address, payload)
      .pipe(
        catchError(() => of()),
        filter(quote => quote !== null && quote !== undefined),
        tap((value: ISwapAmountOutQuoteResponse) => this.tokenOutAmount.setValue(value.amountOut, { emitEvent: false })),
        tap(_ => this.calcTotals()),
        filter(_ => this.context.wallet !== undefined),
        switchMap(_ => this.validateAllowance()));
  }

  private validateAllowance(): Observable<boolean> {
    if (!this.tokenIn || !this.tokenOut || this.tokenIn.address === 'CRS' || !this.context?.wallet || !this.tokenInAmount.value) {
      this.allowance = null;
      return of(false);
    }

    return this._platformApi.getAllowance(this.context.wallet, this._env.routerAddress, this.tokenIn.address)
      .pipe(
        map((response: IAddressAllowanceResponse) => new AllowanceValidation(response, this.tokenInAmount.value, this.tokenIn)),
        tap((allowance: AllowanceValidation) => this.allowance = allowance),
        map((allowance: AllowanceValidation) => allowance.isApproved));
  }

  private refreshToken(address: string): void {
    if (address === null || address === undefined) return;

    this._tokensService.getToken(address)
      .pipe(
        tap(token => {
          if (token.address === this.tokenIn?.address) this.tokenIn = token as IMarketToken;
          else if (token.address === this.tokenOut?.address) this.tokenOut = token as IMarketToken;
        }),
        take(1))
      .subscribe();
  }

  destroyContext$(): void {
    this.context$.unsubscribe();
  }

  ngOnDestroy(): void {
    this.destroyContext$();
    this.subscription.unsubscribe();
  }
}
