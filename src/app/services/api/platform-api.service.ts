import { TokensFilter } from '@sharedModels/platform-api/requests/tokens/tokens-filter';
import { IMarketToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { IAddressMiningPositions } from '@sharedModels/platform-api/responses/wallets/address-mining.interface';
import { IBlock } from '@sharedModels/platform-api/responses/blocks/block.interface';
import { IAddressMining } from '@sharedModels/platform-api/responses/wallets/address-mining.interface';
import { IAddressStaking, IAddressStakingPositions } from '@sharedModels/platform-api/responses/wallets/address-staking.interface';
import { ITransactionBroadcast } from '@sharedModels/platform-api/responses/transactions/transaction-broadcast.interface';
import { IMarket } from '@sharedModels/platform-api/responses/markets/market.interface';
import { IMiningGovernance, IMiningGovernances } from '@sharedModels/platform-api/responses/mining-governances/mining-governance.interface';
import { IAddressBalance, IAddressBalances } from '@sharedModels/platform-api/responses/wallets/address-balance.interface';
import { Router } from '@angular/router';
import { JwtService } from '@sharedServices/utility/jwt.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestApiService } from './rest-api.service';
import { ErrorService } from '@sharedServices/utility/error.service';
import { Observable } from 'rxjs';
import { ILiquidityPoolsResponse, ILiquidityPoolResponse, IMiningPool } from '@sharedModels/platform-api/responses/liquidity-pools/liquidity-pool-responses.interface';
import { LiquidityPoolsFilter } from '@sharedModels/platform-api/requests/liquidity-pools/liquidity-pool-filter';
import { TransactionRequest } from '@sharedModels/platform-api/requests/transactions/transactions-filter';
import { ITransactionReceipt, ITransactionReceipts } from '@sharedModels/platform-api/responses/transactions/transaction.interface';
import { IAddressAllowanceResponse } from '@sharedModels/platform-api/responses/wallets/address-allowance.interface';
import { IToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { IVaultCertificates } from '@sharedModels/platform-api/responses/vaults/vault-certificate.interface';
import { IMiningQuote } from '@sharedModels/platform-api/requests/mining-pools/mining-quote';
import { ITransactionQuote } from '@sharedModels/platform-api/responses/transactions/transaction-quote.interface';
import { IMiningPools } from '@sharedModels/platform-api/responses/mining-pools/mining-pool.interface';
import { IVaults, IVault } from '@sharedModels/platform-api/responses/vaults/vault.interface';
import { IApproveAllowanceRequest } from '@sharedModels/platform-api/requests/tokens/approve-allowance-request';
import { ICreateLiquidityPoolRequest } from '@sharedModels/platform-api/requests/liquidity-pools/create-liquidity-pool-request';
import { IStartStakingRequest } from '@sharedModels/platform-api/requests/liquidity-pools/start-staking-request';
import { IStopStakingRequest } from '@sharedModels/platform-api/requests/liquidity-pools/stop-staking-request';
import { ICollectStakingRewardsRequest } from '@sharedModels/platform-api/requests/liquidity-pools/collect-staking-rewards-request';
import { IAddLiquidityRequest } from '@sharedModels/platform-api/requests/liquidity-pools/add-liquidity-request';
import { IRemoveLiquidityRequest } from '@sharedModels/platform-api/requests/liquidity-pools/remove-liquidity-request';
import { IAddLiquidityAmountInQuoteRequest } from '@sharedModels/platform-api/requests/quotes/add-liquidity-amount-in-quote-request';
import { IRewardMiningPoolsRequest } from '@sharedModels/platform-api/requests/governances/reward-mining-pools-request';
import { IQuoteReplayRequest } from '@sharedModels/platform-api/requests/transactions/quote-replay-request';
import { ITransactionBroadcastNotificationRequest } from '@sharedModels/platform-api/requests/transactions/transaction-broadcast-notification-request';
import { ISwapRequest } from '@sharedModels/platform-api/requests/tokens/swap-request';
import { IAddTokenRequest } from '@sharedModels/platform-api/requests/tokens/add-token-request';
import { ISwapAmountOutQuoteResponse } from '@sharedModels/platform-api/responses/tokens/swap-amount-out-quote-response.interface';
import { ISwapAmountInQuoteResponse } from '@sharedModels/platform-api/responses/tokens/swap-amount-in-quote-response.interface';
import { SwapAmountInQuoteRequest } from '@sharedModels/platform-api/requests/tokens/swap-amount-in-quote-request';
import { SwapAmountOutQuoteRequest } from '@sharedModels/platform-api/requests/tokens/swap-amount-out-quote-request';
import { IMarketTokensResponse } from '@sharedModels/platform-api/responses/tokens/market-tokens-response.interface';
import { ITokensResponse } from '@sharedModels/platform-api/responses/tokens/tokens-response.interface';
import { EnvironmentsService } from '@sharedServices/utility/environments.service';
import { ITokenHistoryResponse } from '@sharedModels/platform-api/responses/tokens/token-history-response.interface';
import { HistoryFilter } from '@sharedModels/platform-api/requests/history-filter';
import { IMarketHistoryResponse } from '@sharedModels/platform-api/responses/markets/market-history-response.interface';
import { ILiquidityPoolSnapshotHistoryResponse } from '@sharedModels/platform-api/responses/liquidity-pools/liquidity-pool-snapshots-responses.interface';
import { IProvideAmountInResponse } from '@sharedModels/platform-api/responses/liquidity-pools/provide-amount-in-response.interface';
import { IStratisSignatureAuthRequest } from '@sharedModels/platform-api/requests/auth/stratis-signature-auth-request.interface';

@Injectable({
  providedIn: 'root'
})
export class PlatformApiService extends RestApiService {
  private api: string;
  private marketAddress: string;

  constructor(
    protected _http: HttpClient,
    protected _error: ErrorService,
    protected _jwt: JwtService,
    protected _router: Router,
    private _env: EnvironmentsService
  ) {
    super(_http, _error, _jwt, _router);
    this.api = this._env.apiUrl;
    this.marketAddress = this._env.marketAddress;
  }

  ////////////////////////////
  // Auth
  ////////////////////////////

  public auth(wallet: string): Observable<string> {
    let walletParam = '?wallet='
    if (wallet) walletParam = `${walletParam}${wallet}`;

    return this.post(`${this.api}/auth/authorize${walletParam}`, {}, { responseType: 'text' });
  }

  public authCallback(payload: IStratisSignatureAuthRequest): Observable<void> {
    return this.post(`${this.api}/auth`, payload);
  }

  public signMessage(payload: IStratisSignatureAuthRequest): Observable<void> {
    return this.post(`${this.api}/auth/sign-message`, payload);
  }

  ////////////////////////////
  // Indexer
  ////////////////////////////

  public getLatestSyncedBlock(): Observable<IBlock> {
    return this.get<IBlock>(`${this.api}/index/latest-block`);
  }

  ////////////////////////////
  // Market Tokens
  ////////////////////////////

  public getMarketToken(address: string): Observable<IMarketToken> {
    return this.get<IMarketToken>(`${this.api}/markets/${this.marketAddress}/tokens/${address}`);
  }

  public getMarketTokens(request: TokensFilter): Observable<IMarketTokensResponse> {
    return this.get<IMarketTokensResponse>(`${this.api}/markets/${this.marketAddress}/tokens${request.buildQueryString()}`);
  }

  public getMarketTokenHistory(tokenAddress: string, request: HistoryFilter): Observable<ITokenHistoryResponse> {
    return this.get<ITokenHistoryResponse>(`${this.api}/markets/${this.marketAddress}/tokens/${tokenAddress}/history${request.buildQueryString()}`);
  }

  public swapQuote(address: string, payload: ISwapRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/markets/${this.marketAddress}/tokens/${address}/swap`, payload);
  }

  public swapAmountInQuote(tokenIn: string, payload: SwapAmountInQuoteRequest): Observable<ISwapAmountInQuoteResponse> {
    return this.post<ISwapAmountInQuoteResponse>(`${this.api}/markets/${this.marketAddress}/tokens/${tokenIn}/swap/amount-in`, payload);
  }

  public swapAmountOutQuote(tokenOut: string, payload: SwapAmountOutQuoteRequest): Observable<ISwapAmountOutQuoteResponse> {
    return this.post<ISwapAmountOutQuoteResponse>(`${this.api}/markets/${this.marketAddress}/tokens/${tokenOut}/swap/amount-out`, payload);
  }

  ////////////////////////////
  // Tokens
  ////////////////////////////

  public getTokens(request: TokensFilter): Observable<ITokensResponse> {
    return this.get<ITokensResponse>(`${this.api}/tokens${request.buildQueryString()}`);
  }

  public getToken(address: string): Observable<IToken> {
    return this.get<IToken>(`${this.api}/tokens/${address}`);
  }

  public addToken(payload: IAddTokenRequest): Observable<IToken> {
    return this.post<IToken>(`${this.api}/tokens`, payload);
  }

  public getTokenHistory(tokenAddress: string, request: HistoryFilter): Observable<ITokenHistoryResponse> {
    return this.get<ITokenHistoryResponse>(`${this.api}/tokens/${tokenAddress}/history${request.buildQueryString()}`);
  }

  public approveAllowanceQuote(address: string, payload: IApproveAllowanceRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/tokens/${address}/approve`, payload);
  }

  public distributeTokensQuote(address: string): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/tokens/${address}/distribute`, {});
  }


  ////////////////////////////
  // Liquidity Pools
  ////////////////////////////

  public createLiquidityPool(payload: ICreateLiquidityPoolRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools`, payload);
  }

  public getPool(address: string): Observable<ILiquidityPoolResponse> {
    return this.get<ILiquidityPoolResponse>(`${this.api}/liquidity-pools/${address}`);
  }

  public getLiquidityPools(query?: LiquidityPoolsFilter): Observable<ILiquidityPoolsResponse> {
    return this.get<ILiquidityPoolsResponse>(`${this.api}/liquidity-pools${query.buildQueryString()}`);
  }

  public getLiquidityPoolHistory(address: string, request: HistoryFilter): Observable<ILiquidityPoolSnapshotHistoryResponse> {
    return this.get<ILiquidityPoolSnapshotHistoryResponse>(`${this.api}/liquidity-pools/${address}/history${request.buildQueryString()}`);
  }

  public startStakingQuote(address: string, payload: IStartStakingRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools/${address}/staking/start`, payload);
  }

  public stopStakingQuote(address: string, payload: IStopStakingRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools/${address}/staking/stop`, payload);
  }

  public collectStakingRewardsQuote(address: string, payload: ICollectStakingRewardsRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools/${address}/staking/collect`, payload);
  }

  public addLiquidityQuote(address: string, payload: IAddLiquidityRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools/${address}/add`, payload);
  }

  public removeLiquidityQuote(address: string, payload: IRemoveLiquidityRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/liquidity-pools/${address}/remove`, payload);
  }

  public quoteAddLiquidity(address: string, payload: IAddLiquidityAmountInQuoteRequest): Observable<IProvideAmountInResponse> {
    return this.post<IProvideAmountInResponse>(`${this.api}/liquidity-pools/${address}/add/amount-in`, payload);
  }

  ////////////////////////////
  // Mining Pools
  ////////////////////////////

  public getMiningPools(query?: any): Observable<IMiningPools> {
    return this.get<IMiningPools>(`${this.api}/mining-pools${query?.getQuery() || ''}`);
  }

  public getMiningPool(address: string): Observable<IMiningPool> {
    return this.get<IMiningPool>(`${this.api}/mining-pools/${address}`);
  }

  public startMiningQuote(address: string, payload: IMiningQuote): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/mining-pools/${address}/start`, payload);
  }

  public stopMiningQuote(address: string, payload: IMiningQuote): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/mining-pools/${address}/stop`, payload);
  }

  public collectMiningRewardsQuote(address: string): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/mining-pools/${address}/collect`, {});
  }

  ////////////////////////////
  // Mining Governances
  ////////////////////////////

  public getMiningGovernances(): Observable<IMiningGovernances> {
    return this.get<IMiningGovernances>(`${this.api}/mining-governances`);
  }

  public getMiningGovernance(address: string): Observable<IMiningGovernance> {
    return this.get<IMiningGovernance>(`${this.api}/mining-governances/${address}`);
  }

  public rewardMiningPoolsQuote(address: string, payload: IRewardMiningPoolsRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/mining-governances/${address}/reward-mining-pools`, payload);
  }

  ////////////////////////////
  // Vaults
  ////////////////////////////

  public getVaults(): Observable<IVaults> {
    return this.get<IVaults>(`${this.api}/vaults`);
  }

  public getVault(address: string): Observable<IVault> {
    return this.get<IVault>(`${this.api}/vaults/${address}`);
  }

  public getVaultCertificates(address: string, limit?: number, cursor?: string): Observable<IVaultCertificates> {
    let query = cursor ? `?cursor=${cursor}` : `?limit=${limit}&direction=ASC`;
    return this.get<IVaultCertificates>(`${this.api}/vaults/${address}/certificates${query}`);
  }

  ////////////////////////////
  // Vault Governances
  ////////////////////////////

  public getVaultGovernance(address: string): Observable<any> {
    return this.get<any>(`${this.api}/vault-governances/${address}`);
  }

  public redeemVaultCertificate(vault: string, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/certificates/redeem`, payload);
  }

  public getVaultProposal(address: string, proposalId: number): Observable<any> {
    return this.get<any>(`${this.api}/vault-governances/${address}/proposals/${proposalId}`);
  }

  public createCertificateVaultProposal(vault: string, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/create-certificate`, payload);
  }

  public revokeCertificateVaultProposal(vault: string, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/revoke-certificate`, payload);
  }

  public minimumPledgeVaultProposal(vault: string, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/minimum-pledge`, payload);
  }

  public minimumVoteVaultProposal(vault: string, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/minimum-vote`, payload);
  }

  public completeVaultProposal(vault: string, proposalId: number, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/${proposalId}/complete`, payload);
  }

  public getVaultProposalPledge(address: string, proposalId: number, pledger: string): Observable<any> {
    return this.get<any>(`${this.api}/vault-governances/${address}/proposals/${proposalId}/pledges/${pledger}`);
  }

  public pledgeToVaultProposal(vault: string, proposalId: number, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/${proposalId}/pledges`, payload);
  }

  public withdrawVaultProposalPledge(vault: string, proposalId: number, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/${proposalId}/pledges/withdraw`, payload);
  }

  public getVaultProposalVote(address: string, proposalId: number, voter: string): Observable<any> {
    return this.get<any>(`${this.api}/vault-governances/${address}/proposals/${proposalId}/votes/${voter}`);
  }

  public voteOnVaultProposal(vault: string, proposalId: number, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/${proposalId}/votes`, payload);
  }

  public withdrawVaultProposalVote(vault: string, proposalId: number, payload: any): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/vault-governances/${vault}/proposals/${proposalId}/votes/withdraw`, payload);
  }

  ////////////////////////////
  // Markets
  ////////////////////////////

  public getMarketOverview(): Observable<IMarket> {
    return this.get<IMarket>(`${this.api}/markets/${this.marketAddress}`);
  }

  public getMarketHistory(request: HistoryFilter): Observable<IMarketHistoryResponse> {
    return this.get<IMarketHistoryResponse>(`${this.api}/markets/${this.marketAddress}/history${request.buildQueryString()}`);
  }

  ////////////////////////////
  // Transactions
  ////////////////////////////

  public getTransactions(request: TransactionRequest): Observable<ITransactionReceipts> {
    return this.get<ITransactionReceipts>(`${this.api}/transactions${request.buildQueryString()}`);
  }

  public getTransaction(hash: string): Observable<ITransactionReceipt> {
    return this.get<ITransactionReceipt>(`${this.api}/transactions/${hash}`);
  }

  public broadcastQuote(payload: IQuoteReplayRequest): Observable<ITransactionBroadcast> {
    return this.post<ITransactionBroadcast>(`${this.api}/transactions/broadcast-quote`, payload);
  }

  public replayQuote(payload: IQuoteReplayRequest): Observable<ITransactionQuote> {
    return this.post<ITransactionQuote>(`${this.api}/transactions/replay-quote`, payload);
  }

  public notifyTransaction(payload: ITransactionBroadcastNotificationRequest): Observable<void> {
    return this.post(`${this.api}/transactions`, payload);
  }

  ////////////////////////////////////////////////////////
  // Wallet Transactions - Temporary Local ENV only
  ////////////////////////////////////////////////////////

  // Balances
  public getWalletBalances(wallet: string, tokenType = 'All', limit?: number, cursor?: string): Observable<IAddressBalances> {
    let query = cursor ? `?cursor=${cursor}` : `?limit=${limit}&direction=ASC&tokenType=${tokenType}`;

    return this.get<IAddressBalances>(`${this.api}/wallets/${wallet}/balance${query}`);
  }

  public getAllowance(owner: string, spender: string, token: string): Observable<IAddressAllowanceResponse> {
    return this.get<IAddressAllowanceResponse>(`${this.api}/wallets/${owner}/allowance/${token}/approved/${spender}`);
  }

  public getBalance(owner: string, token: string): Observable<IAddressBalance> {
    return this.get<IAddressBalance>(`${this.api}/wallets/${owner}/balance/${token}`);
  }

  public getStakingPosition(owner: string, liquidityPool: string): Observable<IAddressStaking> {
    return this.get<IAddressStaking>(`${this.api}/wallets/${owner}/staking/${liquidityPool}`);
  }

  public getMiningPosition(owner: string, miningPool: string): Observable<IAddressMining> {
    return this.get<IAddressMining>(`${this.api}/wallets/${owner}/mining/${miningPool}`);
  }

  public getMiningPositions(owner: string, limit?: number, cursor?: string): Observable<IAddressMiningPositions> {
    let query = cursor ? `?cursor=${cursor}` : `?limit=${limit}&direction=ASC`;

    return this.get<IAddressMiningPositions>(`${this.api}/wallets/${owner}/mining${query}`);
  }

  public getStakingPositions(owner: string, limit?: number, cursor?: string): Observable<IAddressStakingPositions> {
    let query = cursor ? `?cursor=${cursor}` : `?limit=${limit}&direction=ASC`;

    return this.get<IAddressStakingPositions>(`${this.api}/wallets/${owner}/staking${query}`);
  }
}
