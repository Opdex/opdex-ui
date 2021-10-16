import { ILiquidityPoolSummary, ILiquidityPoolSnapshotHistory } from '@sharedModels/platform-api/responses/liquidity-pools/liquidity-pool.interface';
import { PlatformApiService } from '@sharedServices/api/platform-api.service';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { CacheService } from '../utility/cache.service';
import { LiquidityPoolsSearchQuery } from '@sharedModels/platform-api/requests/liquidity-pools/liquidity-pool-filter';

@Injectable({providedIn: 'root'})
export class LiquidityPoolsService extends CacheService {

  constructor(private _platformApi: PlatformApiService, protected _injector: Injector) {
    super(_injector);
  }

  getLiquidityPool(address: string, cacheOnly?: boolean): Observable<ILiquidityPoolSummary> {
    return this.getItem(address, this._platformApi.getPool(address), cacheOnly);
  }

  getLiquidityPoolHistory(address: string, timeSpan: string = '1Y'): Observable<ILiquidityPoolSnapshotHistory> {
    return this.getItem(`${address}-history-${timeSpan}`, this._platformApi.getPoolHistory(address, timeSpan));
  }

  getLiquidityPools(request: LiquidityPoolsSearchQuery) {
    return this.getItem(`liquidity-pools-${request.getQuery()}`, this._platformApi.getPools(request));
  }

  refreshPool(address: string): void {
    this.refreshItem(address);
  }

  refreshLiquidityPools(request: LiquidityPoolsSearchQuery): void {
    this.refreshItem(`liquidity-pools-${request.getQuery()}`);
  }

  refreshPoolHistory(address: string, timeSpan: string = '1Y'): void {
    this.refreshItem(`${address}-history-${timeSpan}`);
  }

  getPools() { }
}
