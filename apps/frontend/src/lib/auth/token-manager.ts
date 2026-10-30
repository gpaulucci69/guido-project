export type TokenSet = {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
};
export type TokenRefresher = (refreshToken: string) => Promise<TokenSet>;

export class TokenManager {
  private current?: TokenSet;
  constructor(private readonly refresh: TokenRefresher) {}

  set(tokens: TokenSet): void {
    this.current = tokens;
  }

  async accessToken(now = Date.now()): Promise<string | undefined> {
    if (!this.current) return undefined;
    if (this.current.expiresAt > now + 30_000 || !this.current.refreshToken)
      return this.current.accessToken;
    this.current = await this.refresh(this.current.refreshToken);
    return this.current.accessToken;
  }
}
