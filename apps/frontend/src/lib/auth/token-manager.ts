export type TokenSet = {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
};
export type TokenRefresher = (refreshToken: string) => Promise<TokenSet>;

export class TokenManager {
  private current: TokenSet | undefined;
  private renewal: Promise<TokenSet> | undefined;
  constructor(private readonly refresh: TokenRefresher) {}

  set(tokens: TokenSet): void {
    this.current = tokens;
  }

  async accessToken(now = Date.now()): Promise<string | undefined> {
    if (!this.current) return undefined;
    if (this.current.expiresAt > now + 30_000 || !this.current.refreshToken)
      return this.current.accessToken;
    if (!this.renewal) {
      this.renewal = this.refresh(this.current.refreshToken).finally(() => {
        this.renewal = undefined;
      });
    }
    try {
      this.current = await this.renewal;
    } catch (error) {
      this.current = undefined;
      throw error;
    }
    return this.current.accessToken;
  }
}
