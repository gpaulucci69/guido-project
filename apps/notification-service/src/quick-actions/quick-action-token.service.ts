import { randomUUID } from "node:crypto";

export type QuickActionToken = {
  jti: string;
  tenantId: string;
  obligationId: string;
  expiresAt: Date;
  usedAt?: Date;
};

export class QuickActionTokenService {
  private readonly tokens = new Map<string, QuickActionToken>();

  create(
    tenantId: string,
    obligationId: string,
    now = new Date(),
  ): QuickActionToken {
    const token = {
      jti: randomUUID(),
      tenantId,
      obligationId,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
    this.tokens.set(token.jti, token);
    return token;
  }

  consume(jti: string, tenantId: string, now = new Date()): QuickActionToken {
    const token = this.tokens.get(jti);
    if (!token || token.tenantId !== tenantId)
      throw new Error("Token inválido");
    if (token.usedAt || token.expiresAt <= now)
      throw new Error("El token expiró o ya fue utilizado");
    const consumed = { ...token, usedAt: now };
    this.tokens.set(jti, consumed);
    return consumed;
  }
}
