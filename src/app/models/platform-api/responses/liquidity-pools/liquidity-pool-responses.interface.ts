import { IMarketToken } from '@sharedModels/platform-api/responses/tokens/token.interface';
import { ITokenGroup } from "../tokens/token.interface";
import { IPaging } from '../paging.interface';
import { IMiningPool } from "../mining-pools/mining-pool.interface";

export interface ILiquidityPoolsResponse extends IPaging<ILiquidityPoolResponse> { }

export interface ILiquidityPoolResponse {
  address: string;
  name: string;
  transactionFeePercent: number;
  market: string;
  tokens: ITokenGroup;
  miningPool: IMiningPool;
  summary: ILiquidityPoolSummaryResponse;
  createdBlock: number;
  modifiedBlock: number;
}

export interface ILiquidityPoolSummaryResponse {
  reserves: IReservesSummaryResponse;
  rewards: IRewardsSummaryResponse;
  staking: IStakingSummaryResponse;
  volume: IVolumeSummaryResponse;
  cost: ICostSummaryResponse;
  createdBlock: number;
  modifiedBlock: number;
}

export interface IReservesSummaryResponse {
  crs: string;
  src: string;
  usd: number;
  dailyUsdChangePercent: number;
}

export interface IRewardsSummaryResponse {
  providerDailyUsd: number;
  marketDailyUsd: number;
  totalDailyUsd: number;
}

export interface IVolumeSummaryResponse {
  dailyUsd: number;
}

export interface IStakingSummaryResponse {
  weight: string;
  usd: number;
  dailyWeightChangePercent: number;
  nominated: boolean;
}

export interface ICostSummaryResponse {
  crsPerSrc: string;
  srcPerCrs: string;
}
