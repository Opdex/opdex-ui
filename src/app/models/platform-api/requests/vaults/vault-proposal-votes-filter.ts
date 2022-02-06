export interface IVaultProposalVotesFilter {
  proposalId?: number,
  voter?: string,
  includeZeroBalances?: boolean;
  limit?: number;
  direction?: string;
  cursor?: string;
}

export class VaultProposalVotesFilter {
  proposalId?: number;
  voter?: string;
  includeZeroBalances?: boolean;
  limit?: number;
  direction?: string;
  cursor?: string;

  constructor(request?: IVaultProposalVotesFilter) {
    if (request === null || request === undefined) {
      this.limit = 5;
      this.direction = 'DESC';
      return;
    };

    this.proposalId = request.proposalId;
    this.voter = request.voter;
    this.includeZeroBalances = request.includeZeroBalances;
    this.cursor = this.cursor;
    this.limit = this.limit;
    this.direction = this.direction;
  }

  public buildQueryString(): string {
    if (this.cursor?.length) return `?cursor=${this.cursor}`;

    let query = '';

    query = this.addToQuery(query, 'proposalId', this.proposalId);
    query = this.addToQuery(query, 'voter', this.voter);

    if (!!this.includeZeroBalances) {
      query = this.addToQuery(query, 'includeZeroBalances', this.includeZeroBalances.toString());
    }

    query = this.addToQuery(query, 'limit', this.limit);
    query = this.addToQuery(query, 'direction', this.direction);

    return query
  }

  private addToQuery(query: string, key: string, value: string | number): string {
    if (!!value === false) return query;

    const leading = query.length > 0 ? '&' : '?';

    return `${query}${leading}${key}=${value}`;
  }
}
