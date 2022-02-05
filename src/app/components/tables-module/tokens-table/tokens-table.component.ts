import { ITokenHistoryResponse } from '@sharedModels/platform-api/responses/tokens/token-history-response.interface';
import { IndexService } from '@sharedServices/platform/index.service';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { Component, Input, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TokensFilter } from '@sharedModels/platform-api/requests/tokens/tokens-filter';
import { ITokensResponse } from '@sharedModels/platform-api/responses/tokens/tokens-response.interface';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { ICursor } from '@sharedModels/platform-api/responses/cursor.interface';
import { Icons } from 'src/app/enums/icons';
import { IconSizes } from 'src/app/enums/icon-sizes';
import { HistoryFilter, HistoryInterval } from '@sharedModels/platform-api/requests/history-filter';
import { TokenHistory } from '@sharedModels/token-history';
import { IToken } from '@sharedModels/platform-api/responses/tokens/token.interface';

@Component({
  selector: 'opdex-tokens-table',
  templateUrl: './tokens-table.component.html',
  styleUrls: ['./tokens-table.component.scss']
})
export class TokensTableComponent implements OnChanges, OnDestroy {
  @Input() filter: TokensFilter;
  displayedColumns: string[];
  dataSource: MatTableDataSource<any>;
  paging: ICursor;
  token$: Observable<ITokensResponse>;
  subscription: Subscription;
  icons = Icons;
  iconSizes = IconSizes;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _router: Router, private _tokensService: TokensService, private _indexService: IndexService) {
    this.dataSource = new MatTableDataSource<any>();
    this.displayedColumns = ['token', 'name', 'interflux', 'price', 'history'];
  }

  ngOnChanges() {
    if (this.filter && !this.subscription) {
      this.subscription = new Subscription();
      this.subscription.add(
        this._indexService.getLatestBlock$()
          .pipe(switchMap(_ => this.getTokens$(this.filter?.cursor)))
          .subscribe())
    }
  }

  private getTokens$(cursor?: string): Observable<ITokensResponse> {
    this.filter.cursor = cursor;

    return this._tokensService.getTokens(this.filter)
      .pipe(
        switchMap((tokens: ITokensResponse) => {
          this.paging = tokens.paging;
          const poolArray$: Observable<any>[] = [];
          tokens.results.forEach(token => poolArray$.push(this.getTokenHistory$(token)));
          return forkJoin(poolArray$);
        }),
        map(tokens => {
          this.dataSource.data = [...tokens];
          return {results: tokens, paging: this.paging}
        }),
        take(1)
      );
  }

  private getTokenHistory$(token: any): Observable<any> {
    const startDate = HistoryFilter.historicalDate(HistoryFilter.startOfDay(new Date()), 30);;
    const endDate = HistoryFilter.endOfDay(new Date());
    const historyFilter = new HistoryFilter(startDate, endDate, HistoryInterval.Daily);

    return this._tokensService.getTokenHistory(token.address, historyFilter)
      .pipe(
        take(1),
        map((tokenHistory: ITokenHistoryResponse) => {
          const history = new TokenHistory(tokenHistory);
          token.snapshotHistory = history.line;
          return token;
        }));
  }

  pageChange(cursor: string) {
    this.getTokens$(cursor).pipe(take(1)).subscribe();
  }

  navigate(name: string) {
    this._router.navigateByUrl(`/tokens/${name}`);
  }

  trackBy(index: number, token: IToken) {
    return `${index}-${token.address}-${token.summary.dailyPriceChangePercent}-${token.summary.priceUsd}`;
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
