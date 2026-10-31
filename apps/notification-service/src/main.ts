import { createServer } from "node:http";
import {
  healthResponse,
  isHealthPath,
} from "../../../packages/observability/src/health-controller.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { requirePermission } from "../../identity-sync-service/src/auth/guards/permission.guard.js";
import { prisma } from "../../../packages/database/src/prisma-client.js";
import { PostgresPortfolioAccess } from "../../../packages/database/src/portfolio-access.js";
import { createPrismaPortfolioClientDelegate } from "../../../packages/database/src/prisma-portfolio-access.js";
const port = Number(process.env.PORT ?? 3003);
const portfolioAccess = new PostgresPortfolioAccess(
  createPrismaPortfolioClientDelegate(prisma),
);
createServer((request, response) => {
  if (isHealthPath(request.url)) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(healthResponse("notification-service")));
    return;
  }
  void authenticateHeaders(request.headers)
    .then(async (identity) => {
      requirePermission(identity, "route", "/home/customers");
      const url = new URL(request.url ?? "/", "http://localhost");
      if (request.method === "GET" && url.pathname === "/api/v1/claims") {
        const clientId = url.searchParams.get("clientId");
        if (!clientId) throw new Error("clientId requerido");
        await portfolioAccess.assertCanAccessClient(identity, clientId);
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify([]));
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
    })
    .catch(() => {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          type: "about:blank",
          title: "Autenticación requerida",
          status: 401,
        }),
      );
    });
}).listen(port);
