import { tap } from 'rxjs/operators';
import { ILiquidityPoolSummary } from '@sharedModels/platform-api/responses/liquidity-pools/liquidity-pool.interface';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { BlocksService } from '@sharedServices/platform/blocks.service';
import { SidenavService } from '@sharedServices/utility/sidenav.service';
import { Component, OnDestroy } from '@angular/core';
import { TokensFilter } from '@sharedModels/platform-api/requests/tokens/tokens-filter';
import { TransactionView } from '@sharedModels/transaction-view';
import { LiquidityPoolsFilter, LpOrderBy } from '@sharedModels/platform-api/requests/liquidity-pools/liquidity-pool-filter';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'opdex-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss']
})
export class TokensComponent implements OnDestroy {
  filter: TokensFilter;
  subscription = new Subscription();
  poolsByVolume: ILiquidityPoolSummary[] = [];

  constructor(
    private _sidebar: SidenavService,
    private _blocksService: BlocksService,
    private _liquidityPoolsService: LiquidityPoolsService)
  {
    // Initialize placeholder skeleton
    this.poolsByVolume = [ null, null, null, null ];

    this.filter = new TokensFilter({
      orderBy: 'DailyPriceChangePercent',
      direction: 'DESC',
      limit: 10,
      provisional: 'NonProvisional'
    });

    const volumeFilter = new LiquidityPoolsFilter({orderBy: LpOrderBy.Volume, limit: 4, direction: 'DESC'});

    this.subscription.add(
      this._blocksService.getLatestBlock$()
        .pipe(
          switchMap(_ => this._liquidityPoolsService.getLiquidityPools(volumeFilter)),
          tap(pools => this.poolsByVolume = pools.results))
        .subscribe());
  }

  poolsTrackBy(index: number, pool: ILiquidityPoolSummary) {
    if (pool === null || pool === undefined) return index;
    return `${index}-${pool.address}-${pool.cost.crsPerSrc.close}-${pool.mining?.tokensMining}-${pool.staking?.weight}`;
  }

  handleTxOption($event: TransactionView) {
    this._sidebar.openSidenav($event);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
