import { VaultProposalVote } from '@sharedModels/ui/vaults/vault-proposal-vote';
import { VaultProposalPledge } from '@sharedModels/ui/vaults/vault-proposal-pledge';
import { Vault } from '@sharedModels/ui/vaults/vault';
import { IconSizes } from 'src/app/enums/icon-sizes';
import { Icons } from 'src/app/enums/icons';
import { catchError } from 'rxjs/operators';
import { UserContextService } from '@sharedServices/utility/user-context.service';
import { VaultProposalPledgesFilter, IVaultProposalPledgesFilter } from '@sharedModels/platform-api/requests/vaults/vault-proposal-pledges-filter';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { IBlock } from '@sharedModels/platform-api/responses/blocks/block.interface';
import { IndexService } from '@sharedServices/platform/index.service';
import { TokensService } from '@sharedServices/platform/tokens.service';
import { VaultsService } from '@sharedServices/platform/vaults.service';
import { SidenavService } from '@sharedServices/utility/sidenav.service';
import { Observable, of, Subscription } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { StatCardInfo } from '@sharedModels/stat-card-info';
import { TransactionView } from '@sharedModels/transaction-view';
import { FixedDecimal } from '@sharedModels/types/fixed-decimal';
import { IVaultProposalVotesFilter, VaultProposalVotesFilter } from '@sharedModels/platform-api/requests/vaults/vault-proposal-votes-filter';
import { UserContext } from '@sharedModels/user-context';
import { Token } from '@sharedModels/ui/tokens/token';
import { VaultProposal } from '@sharedModels/ui/vaults/vault-proposal';

@Component({
  selector: 'opdex-vault-proposal',
  templateUrl: './vault-proposal.component.html',
  styleUrls: ['./vault-proposal.component.scss']
})
export class VaultProposalComponent {
  subscription: Subscription = new Subscription();
  vault: Vault;
  token: Token;
  latestBlock: IBlock;
  pledgesFilter: VaultProposalPledgesFilter;
  votesFilter: VaultProposalVotesFilter;
  proposal: VaultProposal;
  context: UserContext;
  userVote: VaultProposalVote;
  userPledge: VaultProposalPledge;
  pledgePercentage: FixedDecimal;
  icons = Icons;
  iconSizes = IconSizes;

  constructor(
    private _vaultsService: VaultsService,
    private _tokensService: TokensService,
    private _indexService: IndexService,
    private _sidebar: SidenavService,
    private _route: ActivatedRoute,
    private _context: UserContextService
  ) {
    const proposalId = parseInt(this._route.snapshot.paramMap.get('proposalId'));

    this.subscription.add(this._context.getUserContext$().subscribe(context => this.context = context));

    this.subscription.add(
      this._indexService.getLatestBlock$()
        .pipe(
          tap(block => this.latestBlock = block),
          switchMap(_ => this.getVault$()),
          switchMap(_ => this.getProposal$(proposalId)),
          switchMap(_ => this.getVote$()),
          switchMap(_ => this.getPledge$()))
        .subscribe());

    this.pledgesFilter = new VaultProposalPledgesFilter({
      proposalId: proposalId,
      limit: 5,
      direction: 'DESC',
      includeZeroBalances: true
    } as IVaultProposalPledgesFilter);

    this.votesFilter = new VaultProposalVotesFilter({
      proposalId: proposalId,
      limit: 5,
      direction: 'DESC',
      includeZeroBalances: true
    } as IVaultProposalVotesFilter);
  }

  getProposal$(proposalId: number): Observable<VaultProposal> {
    return this._vaultsService
      .getProposal(proposalId)
      .pipe(tap(proposal => {
        this.proposal = proposal;
        this.setPledgePercentage();
      }));
  }

  getVault$(): Observable<Token> {
    return this._vaultsService.getVault()
      .pipe(
        tap(vault => this.vault = vault),
        switchMap(_ => this._tokensService.getToken(this.vault.token)),
        map(token => {
          this.token = token;
          return this.token;
        }));
  }

  getVote$(): Observable<VaultProposalVote> {
    if (this.proposal.status === 'Pledge' || !!this.context?.wallet === false) return of(null);

    return this._vaultsService.getVote(this.proposal.proposalId, this.context.wallet, this.proposal.vault)
      .pipe(
        catchError(_ => of(null)),
        tap((vote: VaultProposalVote) => this.userVote = vote));
  }

  getPledge$(): Observable<VaultProposalPledge> {
    if (!!this.context?.wallet === false) return of(null);

    return this._vaultsService.getPledge(this.proposal.proposalId, this.context.wallet, this.proposal.vault)
      .pipe(
        catchError(_ => of(null)),
        tap((pledge: VaultProposalPledge) => this.userPledge = pledge));
  }

  openTransactionView(view: string, withdraw: boolean) {
    this._sidebar.openSidenav(TransactionView.vaultProposal, { child: view, withdraw, proposalId: this.proposal.proposalId });
  }

  proposalsTrackBy(index: number, proposal: VaultProposal) {
    if (proposal === null || proposal === undefined) return index;
    return `${index}-${proposal.proposalId}-${proposal.status}-${proposal.expiration}-${proposal.pledgeAmount}-${proposal.yesAmount}-${proposal.noAmount}`;
  }

  private setPledgePercentage(): void {
    const minimum = this.vault.totalPledgeMinimum;
    const pledge = this.proposal.pledgeAmount;

    this.pledgePercentage = pledge.divide(minimum).multiply(FixedDecimal.OneHundred(0));
  }

  getExpirationPercentage(proposal: VaultProposal) {
    if (proposal.status === 'Complete' || proposal.expiration <= this.latestBlock.height) return 100;

    const threeDays = 60 * 60 * 24 * 3 / 16;
    const oneWeek = 60 * 60 * 24 * 7 / 16;
    const duration = proposal.status === 'Pledge' ? oneWeek : threeDays;
    const startBlock = proposal.expiration - duration;
    const blocksPassed = this.latestBlock.height - startBlock;

    return Math.floor((blocksPassed / duration) * 100);
  }

  getVotePercentage(first: FixedDecimal, second: FixedDecimal): FixedDecimal {
    const oneHundred = FixedDecimal.OneHundred(0);

    if (second.bigInt === BigInt(0) && first.bigInt > BigInt(0)) return oneHundred;
    else if (second.bigInt === BigInt(0) && first.bigInt == BigInt(0)) return FixedDecimal.Zero(0);

    return first.divide(second).multiply(oneHundred);
  }

  statCardTrackBy(index: number, statCard: StatCardInfo) {
    return `${index}-${statCard.title}-${statCard.value}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
