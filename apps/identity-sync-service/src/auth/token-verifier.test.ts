import { describe, expect, it } from "vitest";
import { verifyAccessToken } from "./token-verifier";

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
const unsigned = (claims: Record<string, unknown>, alg = "none") =>
  `${encode({ alg, typ: "Bearer", kid: "dev" })}.${encode(claims)}.invalid`;

describe("verifyAccessToken", () => {
  it("rejects tokens with an unsupported algorithm before network access", async () => {
    await expect(
      verifyAccessToken(
        unsigned({
          iss: "http://localhost:8080/realms/saas-contable",
          aud: "account",
          sub: "user",
          typ: "Bearer",
          exp: 2_000_000_000,
        }),
        {
          issuer: "http://localhost:8080/realms/saas-contable",
          audience: "account",
        },
      ),
    ).rejects.toThrow("Algoritmo");
  });

  it("rejects an ID token even when its issuer and audience are valid", async () => {
    await expect(
      verifyAccessToken(
        unsigned(
          {
            iss: "http://localhost:8080/realms/saas-contable",
            aud: "account",
            sub: "user",
            typ: "ID",
            exp: 2_000_000_000,
          },
          "RS256",
        ),
        {
          issuer: "http://localhost:8080/realms/saas-contable",
          audience: "account",
        },
      ),
    ).rejects.toThrow("Bearer");
  });
});
