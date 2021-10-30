export interface ITokensRequest {
  tokens?: string[];
  provisional?: string;
  orderBy?: string;
  limit?: number;
  direction?: string;
  cursor?: string;
  keyword?: string;
}

export class TokensFilter implements ITokensRequest {
  keyword?: string;
  tokens?: string[];
  provisional?: string;
  orderBy?: string;
  limit?: number;
  direction?: string;
  cursor?: string

  constructor(request?: ITokensRequest) {
    if (request === null || request === undefined) {
      this.limit = 5;
      this.direction = 'DESC';
      return;
    };

    this.keyword = request.keyword;
    this.tokens = request.tokens;
    this.provisional = request.provisional;
    this.orderBy = request.orderBy;
    this.cursor = request.cursor;
    this.limit = request.limit;
    this.direction = request.direction;
  }

  public buildQueryString(): string {
    if (this.cursor?.length) return `?cursor=${this.cursor}`;

    let query = '';

    if (this.tokens?.length > 0) {
      this.tokens.forEach(contract => query = this.addToQuery(query, 'tokens', contract));
    }

    query = this.addToQuery(query, 'keyword', this.keyword);
    query = this.addToQuery(query, 'provisional', this.provisional);
    query = this.addToQuery(query, 'orderBy', this.orderBy);
    query = this.addToQuery(query, 'limit', this.limit);
    query = this.addToQuery(query, 'direction', this.direction);

    return query
  }

  private addToQuery(query: string, key: string, value: string | number): string {
    if (value === null || value === undefined) return query;

    const leading = query.length > 0 ? '&' : '?';

    return `${query}${leading}${key}=${value}`;
  }
}
