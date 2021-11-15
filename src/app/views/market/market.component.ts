import { IMarket } from '@sharedModels/platform-api/responses/markets/market.interface';
import { BlocksService } from '@sharedServices/platform/blocks.service';
import { MarketHistory } from '@sharedModels/market-history';
import { IMarketSnapshot } from '@sharedModels/platform-api/responses/markets/market-snapshot.interface';
import { Icons } from 'src/app/enums/icons';
import { IconSizes } from 'src/app/enums/icon-sizes';
import { SidenavService } from '@sharedServices/utility/sidenav.service';
import { ITransactionsRequest } from '@sharedModels/platform-api/requests/transactions/transactions-filter';
import { ILiquidityPoolSummary } from '@sharedModels/platform-api/responses/liquidity-pools/liquidity-pool.interface';
import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';
import { LiquidityPoolsFilter, LpOrderBy, MiningFilter } from '@sharedModels/platform-api/requests/liquidity-pools/liquidity-pool-filter';
import { StatCardInfo } from '@sharedModels/stat-card-info';
import { MarketsService } from '@sharedServices/platform/markets.service';
import { TransactionView } from '@sharedModels/transaction-view';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { TokenOrderByTypes, TokenProvisionalTypes, TokensFilter } from '@sharedModels/platform-api/requests/tokens/tokens-filter';

@Component({
  selector: 'opdex-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  iconSizes = IconSizes;
  icons = Icons;
  subscription = new Subscription();
  market: IMarket;
  marketHistory: MarketHistory;
  miningPools$: Observable<ILiquidityPoolSummary[]>
  transactionRequest: ITransactionsRequest;
  chartData: any[];
  chartOptions = [
    {
      type: 'line',
      category: 'Liquidity',
      prefix: '$',
      decimals: 3
    },
    {
      type: 'bar',
      category: 'Volume',
      prefix: '$',
      decimals: 3
    },
    {
      type: 'line',
      category: 'Staking',
      suffix: '',
      decimals: 2
    }
  ];
  statCards: StatCardInfo[];
  selectedChart = this.chartOptions[0];
  tokensFilter: TokensFilter;
  liquidityPoolsFilter: LiquidityPoolsFilter;

  constructor(
    private _marketsService: MarketsService,
    private _sidebar: SidenavService,
    private _liquidityPoolsService: LiquidityPoolsService,
    private _blocksService: BlocksService
  ) {
    this.setMarketStatCards();
  }

  ngOnInit(): void {
    this.tokensFilter = new TokensFilter({
      orderBy: TokenOrderByTypes.DailyPriceChangePercent,
      direction: 'DESC',
      limit: 10,
      provisional: TokenProvisionalTypes.NonProvisional
    });

    this.liquidityPoolsFilter = new LiquidityPoolsFilter({
      orderBy: LpOrderBy.Liquidity,
      direction: 'DESC',
      limit: 10
    });

    const miningFilter = new LiquidityPoolsFilter({
      orderBy: LpOrderBy.Liquidity,
      limit: 4,
      direction: 'DESC',
      miningFilter: MiningFilter.Enabled
    });

    this.subscription.add(
      this._blocksService.getLatestBlock$()
        .pipe(
          switchMap(_ => this.getMarket()),
          switchMap(_ => this.getMarketHistory()),
          tap(_ => this.miningPools$ = this._liquidityPoolsService.getLiquidityPools(miningFilter).pipe(map(pools => pools.results))))
        .subscribe());
  }

  private getMarket(): Observable<any> {
    return this._marketsService.getMarket()
      .pipe(tap(market => {
        this.market = market;
        this.setMarketStatCards();
        this.chartOptions.map(o => {
          if (o.category === 'Staking') o.suffix = this.market.stakingToken.symbol;
          return 0;
        });
      }));
  }

  private setMarketStatCards(): void {
    this.statCards = [
      {
        title: 'Liquidity',
        value: this.market?.summary?.liquidity?.toString(),
        prefix: '$',
        change: this.market?.summary?.liquidityDailyChange,
        show: true,
        icon: Icons.liquidityPool,
        iconColor: 'primary',
        helpInfo: {
          title: 'What is Liquidity?',
          paragraph: 'Liquidity represents the total USD amount of tokens locked in liquidity pools through provisioning. Liquidity can be measured for the market as a whole, or at an individual liquidity pool level.'
        }
      },
      {
        title: 'Staking',
        value: this.market?.summary?.staking?.weight,
        suffix: this.market?.stakingToken?.symbol,
        change: this.market?.summary?.staking?.weightDailyChange,
        show: true,
        icon: Icons.staking,
        iconColor: 'stake',
        helpInfo: {
          title: 'What is Staking?',
          paragraph: 'Staking in liquidity pools acts as voting in the mining governance to enable liquidity mining. This indicator displays how many tokens are staking and can be represented for the market as a whole or at an individual staking pool level.'
        }
      },
      {
        title: 'Volume',
        value: this.market?.summary?.volume?.toString(),
        prefix: '$',
        daily: true,
        show: true,
        icon: Icons.volume,
        iconColor: 'provide',
        helpInfo: {
          title: 'What is Volume?',
          paragraph: 'Volume is the total USD value of tokens swapped and is usually displayed on a daily time frame. Volume tracks the value of tokens input to the protocol during swaps, plus transaction fees.'
        }
      },
      {
        title: 'Rewards',
        value: this.market?.summary?.rewards?.totalUsd,
        daily: true,
        prefix: '$',
        show: true,
        icon: Icons.rewards,
        iconColor: 'reward',
        helpInfo: {
          title: 'What are Rewards?',
          paragraph: 'The rewards indicator displays the total USD value of transaction fees accumulated based on the volume of swap transactions. Rewards are collected by participants for providing liquidity and for staking in active markets.'
        }
      }
    ];
  }

  private getMarketHistory(timeSpan: string = '1Y'): Observable<void> {
    return this._marketsService.getMarketHistory(timeSpan)
      .pipe(
        delay(1),
        map((marketHistory: IMarketSnapshot[]) => {
          this.marketHistory = new MarketHistory(marketHistory);
          this.handleChartTypeChange(this.selectedChart.category);
        }));
  }

  handleChartTypeChange($event) {
    this.selectedChart = this.chartOptions.find(options => options.category === $event);

    if ($event === 'Liquidity') {
      this.chartData = this.marketHistory.liquidity;
    }

    if ($event === 'Volume') {
      this.chartData = this.marketHistory.volume;
    }

    if ($event === 'Staking') {
      this.chartData = this.marketHistory.staking;
    }
  }

  handleChartTimeChange($event: string) {
    this.getMarketHistory($event).pipe(take(1)).subscribe();
  }

  handleTxOption($event: TransactionView) {
    this._sidebar.openSidenav($event);
  }

  createPool() {
    this._sidebar.openSidenav(TransactionView.createPool);
  }

  poolsTrackBy(index: number, pool: ILiquidityPoolSummary) {
    return `${index}-${pool.address}-${pool.cost.crsPerSrc.close}-${pool.mining?.tokensMining}-${pool.staking?.weight}`;
  }

  statCardTrackBy(index: number, statCard: StatCardInfo) {
    return `${index}-${statCard.title}-${statCard.value}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
