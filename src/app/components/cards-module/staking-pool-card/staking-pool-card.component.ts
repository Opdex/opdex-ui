import { UserContextService } from '@sharedServices/user-context.service';
import { Component, Input } from '@angular/core';
import { ILiquidityPoolSummaryResponse } from '@sharedModels/responses/platform-api/Pools/liquidity-pool.interface';
import { TransactionView } from '@sharedModels/transaction-view';
import { SidenavService } from '@sharedServices/sidenav.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'opdex-staking-pool-card',
  templateUrl: './staking-pool-card.component.html',
  styleUrls: ['./staking-pool-card.component.scss']
})
export class StakingPoolCardComponent {
  @Input() pool: ILiquidityPoolSummaryResponse;
  context$: Observable<any>;

  constructor(private _sidebar: SidenavService, private _context: UserContextService) {
    this.context$ = this._context.getUserContext$();
  }

  provide() {
    this._sidebar.openSidenav(TransactionView.provide, {pool: this.pool});
  }

  swap() {
    this._sidebar.openSidenav(TransactionView.swap, {pool: this.pool});
  }

  stake() {
    this._sidebar.openSidenav(TransactionView.stake, {pool: this.pool});
  }

  mine() {
    this._sidebar.openSidenav(TransactionView.mine, {pool: this.pool});
  }
}
