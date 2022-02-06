import { LiquidityPools } from '@sharedModels/ui/liquidity-pools/liquidity-pools';
import { UserContextService } from '@sharedServices/utility/user-context.service';
import { IndexService } from '@sharedServices/platform/index.service';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidenavService } from '@sharedServices/utility/sidenav.service';
import { TransactionView } from '@sharedModels/transaction-view';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Subscription } from 'rxjs';
import { Icons } from 'src/app/enums/icons';
import { LiquidityPoolsFilter, LpOrderBy, MiningStatus } from '@sharedModels/platform-api/requests/liquidity-pools/liquidity-pool-filter';
import { UserContext } from '@sharedModels/user-context';
import { LiquidityPool } from '@sharedModels/ui/liquidity-pools/liquidity-pool';

interface IPoolsView {
  topVolume: LiquidityPools,
  mining: LiquidityPools
}

@Component({
  selector: 'opdex-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss']
})
export class PoolsComponent implements OnInit, OnDestroy {
  pools: IPoolsView;
  icons = Icons;
  topPoolsFilter: LiquidityPoolsFilter;
  context: UserContext;
  subscription = new Subscription();

  constructor(
    private _sidebar: SidenavService,
    private _liquidityPoolsService: LiquidityPoolsService,
    private _indexService: IndexService,
    private _context: UserContextService
  ) {
    this.topPoolsFilter = new LiquidityPoolsFilter({orderBy: LpOrderBy.Liquidity, limit: 10, direction: 'DESC'});

    // Initialize dummy results for skeleton placeholders
    this.pools = {
      topVolume: new LiquidityPools({
        results: [null, null, null, null],
        paging: null
      }),
      mining: null
    }

    this.subscription.add(
      this._context.getUserContext$()
        .subscribe(context => this.context = context));
  }

  ngOnInit(): void {
    const miningFilter = new LiquidityPoolsFilter({orderBy: LpOrderBy.Liquidity, limit: 4, direction: 'DESC', miningStatus: MiningStatus.Enabled});
    const volumeFilter = new LiquidityPoolsFilter({orderBy: LpOrderBy.Volume, limit: 4, direction: 'DESC'});

    this.subscription.add(this._indexService.getLatestBlock$()
      .pipe(switchMap(_ => {
        return combineLatest([
          this._liquidityPoolsService.getLiquidityPools(volumeFilter),
          this._liquidityPoolsService.getLiquidityPools(miningFilter)
        ]).pipe(map((summaries: LiquidityPools[]) => {
          this.pools = {
            topVolume: summaries[0],
            mining: summaries[1]
          }
        }));
      })).subscribe());
  }

  handleTxOption($event: TransactionView) {
    this._sidebar.openSidenav($event);
  }

  createPool() {
    this._sidebar.openSidenav(TransactionView.createPool);
  }

  poolsTrackBy(index: number, pool: LiquidityPool) {
    if (!!pool === false) return index;
    return `${index}-${pool.address}-${pool.summary.cost.crsPerSrc.formattedValue}-${pool.miningPool?.tokensMining?.formattedValue}-${pool.summary.staking?.weight?.formattedValue}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
