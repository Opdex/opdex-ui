import { Component, Input } from '@angular/core';
import { ILiquidityPoolSummary, IMiningPool } from '@sharedModels/responses/platform-api/liquidity-pools/liquidity-pool.interface';
import { ICollectMiningRewardsEvent } from '@sharedModels/responses/platform-api/transactions/transaction-events/mining-pools/collect-mining-rewards-event.interface';
import { ITransactionEvent } from '@sharedModels/responses/platform-api/transactions/transaction-events/transaction-event.interface';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { MiningPoolsService } from '@sharedServices/platform/mining-pools.service';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TxEventBaseComponent } from '../../tx-event-base.component';

@Component({
  selector: 'opdex-collect-mining-rewards-event',
  templateUrl: './collect-mining-rewards-event.component.html',
  styleUrls: ['./collect-mining-rewards-event.component.scss']
})
export class CollectMiningRewardsEventComponent extends TxEventBaseComponent {
  @Input() txEvent: ITransactionEvent;
  event: ICollectMiningRewardsEvent;
  pool$: Observable<ILiquidityPoolSummary>;

  constructor(private _miningPoolService: MiningPoolsService, protected _liquidityPoolsService: LiquidityPoolsService, protected _tokensService: TokensService) {
    super(_liquidityPoolsService, _tokensService);
  }

  ngOnChanges() {
    this.event = this.txEvent as ICollectMiningRewardsEvent;
    this.pool$ = this._miningPoolService.getMiningPool(this.event.contract)
      .pipe(switchMap((miningPool: IMiningPool) => this._liquidityPoolsService.getLiquidityPool(miningPool.liquidityPool)));
  }
}
