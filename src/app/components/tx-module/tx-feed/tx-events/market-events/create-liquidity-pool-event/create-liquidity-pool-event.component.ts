import { Component, Input } from '@angular/core';
import { IToken } from '@sharedModels/responses/platform-api/tokens/token.interface';
import { ICreateLiquidityPoolEvent } from '@sharedModels/responses/platform-api/transactions/transaction-events/markets/create-liquidity-pool-event.interface';
import { ITransactionEvent } from '@sharedModels/responses/platform-api/transactions/transaction-events/transaction-event.interface';
import { LiquidityPoolsService } from '@sharedServices/platform/liquidity-pools.service';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { Observable } from 'rxjs';
import { TxEventBaseComponent } from '../../tx-event-base.component';

@Component({
  selector: 'opdex-create-liquidity-pool-event',
  templateUrl: './create-liquidity-pool-event.component.html',
  styleUrls: ['./create-liquidity-pool-event.component.scss']
})
export class CreateLiquidityPoolEventComponent extends TxEventBaseComponent {
  @Input() txEvent: ITransactionEvent;
  event: ICreateLiquidityPoolEvent;
  token$: Observable<IToken>;

  constructor(protected _liquidityPoolsService: LiquidityPoolsService, protected _tokensService: TokensService) {
    super(_liquidityPoolsService, _tokensService);
  }

  ngOnChanges() {
    this.event = this.txEvent as ICreateLiquidityPoolEvent;
    this.token$ = this.getToken$(this.event.contract);
  }
}
