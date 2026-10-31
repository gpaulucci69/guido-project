import { createServer } from "node:http";
import {
  healthResponse,
  isHealthPath,
} from "../../../packages/observability/src/health-controller.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { requirePermission } from "../../identity-sync-service/src/auth/guards/permission.guard.js";
import { prisma } from "../../../packages/database/src/prisma-client.js";
const port = Number(process.env.PORT ?? 3002);
createServer((request, response) => {
  if (isHealthPath(request.url)) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(healthResponse("accounting-client-service")));
    return;
  }
  void authenticateHeaders(request.headers)
    .then(async (identity) => {
      requirePermission(identity, "route", "/home/customers");
      if (
        request.method === "GET" &&
        new URL(request.url ?? "/", "http://localhost").pathname ===
          "/api/v1/clients"
      ) {
        const clients = await prisma.accountingClient.findMany({
          where: { tenantId: identity.tenantId },
          orderBy: { businessName: "asc" },
          select: {
            id: true,
            businessName: true,
            cuit: true,
            email: true,
            phone: true,
            status: true,
            representativeAccountantId: true,
          },
        });
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(clients));
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
