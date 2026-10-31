import type { PortfolioClientDelegate } from "./portfolio-access.js";

type PrismaPortfolioClient = {
  accountingClient: PortfolioClientDelegate;
};

export function createPrismaPortfolioClientDelegate(
  prisma: PrismaPortfolioClient,
): PortfolioClientDelegate {
  return {
    findFirst: (args) => prisma.accountingClient.findFirst(args),
  };
}
