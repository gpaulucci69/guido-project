import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { problemFromError } from "../../../packages/http/src/problem-details.js";
import {
  healthResponse,
  isHealthPath,
} from "../../../packages/observability/src/health-controller.js";
import {
  ChangeAuditService,
  InMemoryAuditSink,
} from "./audit/change-audit.service.js";
import { ObligationController } from "./obligations/presentation/obligation.controller.js";
import { ObligationService } from "./obligations/application/obligation.service.js";
import { InMemoryObligationRepository } from "./obligations/infrastructure/obligation.repository.js";
import { PaymentController } from "./payments/presentation/payment.controller.js";
import {
  PaymentService,
  InMemoryPaymentRepository,
} from "./payments/application/payment.service.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { requirePermission } from "../../identity-sync-service/src/auth/guards/permission.guard.js";
import { prisma } from "../../../packages/database/src/prisma-client.js";
import { PostgresPortfolioAccess } from "../../../packages/database/src/portfolio-access.js";
import { createPrismaPortfolioClientDelegate } from "../../../packages/database/src/prisma-portfolio-access.js";
import { CashFlowService } from "./reports/application/cash-flow.service.js";

const audit = new ChangeAuditService(new InMemoryAuditSink());
const obligations = new ObligationService(
  new InMemoryObligationRepository(),
  audit,
);
const payments = new PaymentService(new InMemoryPaymentRepository(), audit);
const obligationController = new ObligationController(obligations);
const portfolioAccess = new PostgresPortfolioAccess(
  createPrismaPortfolioClientDelegate(prisma),
);
async function assertClientAccess(
  identity: Awaited<ReturnType<typeof authenticateHeaders>>,
  clientId: string,
) {
  await portfolioAccess.assertCanAccessClient(identity, clientId);
}
function json(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  });
  response.end(
    JSON.stringify(value, (_, item) =>
      item?.constructor?.name === "ArsMoney" ? item.toString() : item,
    ),
  );
}
async function readBody(
  request: IncomingMessage,
): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}
function parts(url: string) {
  return new URL(url, "http://localhost").pathname.split("/").filter(Boolean);
}
const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization,content-type,accept",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    });
    response.end();
    return;
  }
  if (isHealthPath(request.url)) {
    json(response, 200, healthResponse("billing-workflow-service"));
    return;
  }
  if (!request.url?.startsWith("/api/v1/")) {
    json(response, 404, { error: "Ruta no encontrada" });
    return;
  }
  const path = parts(request.url);
  const resource = path[2];
  const id = path[3];
  try {
    const identity = await authenticateHeaders(request.headers);
    requirePermission(identity, "route", "/home/customers");
    const tenantId = identity.tenantId;
    if (
      resource === "reports" &&
      request.method === "GET" &&
      id === "cash-flow"
    ) {
      const url = new URL(request.url ?? "/", "http://localhost");
      const fromDate = url.searchParams.get("fromDate") ?? "0000-01-01";
      const toDate = url.searchParams.get("toDate") ?? "9999-12-31";
      const obligationsPage = await obligations.list({ tenantId, limit: 100 });
      const rows = [];
      for (const obligation of obligationsPage.items) {
        if (
          !(await portfolioAccess.canAccessClient(
            identity,
            obligation.clientId,
          ))
        )
          continue;
        rows.push({
          clientId: obligation.clientId,
          dueDate: obligation.dueDate,
          totalAmount: obligation.totalAmount.toString(),
          collectedAmount: obligation.totalAmount
            .subtract(obligation.balanceDue)
            .toString(),
          status: obligation.status,
        });
      }
      json(
        response,
        200,
        new CashFlowService(rows).report({ fromDate, toDate }),
      );
      return;
    }
    if (resource === "obligations" && request.method === "GET" && !id) {
      const result = await obligations.list({ tenantId });
      const visible = [];
      for (const obligation of result.items) {
        if (
          await portfolioAccess.canAccessClient(identity, obligation.clientId)
        )
          visible.push(obligation);
      }
      json(response, 200, { ...result, items: visible });
      return;
    }
    if (resource === "obligations" && request.method === "POST" && !id) {
      const input = await readBody(request);
      await assertClientAccess(identity, String(input.clientId ?? ""));
      const result = await obligationController.create({
        ...input,
        tenantId,
      } as never);
      json(response, result.status, result.body);
      return;
    }
    if (resource === "obligations" && request.method === "GET" && id) {
      const obligation = await obligations.get(tenantId, id);
      await assertClientAccess(identity, obligation.clientId);
      const result = await obligationController.detail(tenantId, id);
      json(response, result.status, result.body);
      return;
    }
    if (
      resource === "obligations" &&
      request.method === "POST" &&
      id &&
      path[4] === "cancel"
    ) {
      const obligation = await obligations.get(tenantId, id);
      await assertClientAccess(identity, obligation.clientId);
      const input = await readBody(request);
      const result = await obligationController.cancel(
        tenantId,
        id,
        String(input.reason ?? ""),
      );
      json(response, result.status, result.body);
      return;
    }
    if (
      resource === "obligations" &&
      request.method === "POST" &&
      id &&
      path[4] === "payments"
    ) {
      const obligation = await obligations.get(tenantId, id);
      await assertClientAccess(identity, obligation.clientId);
      const input = await readBody(request);
      const result = await new PaymentController(payments).report({
        ...input,
        tenantId,
        obligationId: id,
        receiptFileName: String(input.receiptFileName ?? "manual.pdf"),
        receiptFileSizeBytes: Number(input.receiptFileSizeBytes ?? 0),
        receiptFileMimeType: (input.receiptFileMimeType ??
          "application/pdf") as "application/pdf",
      } as never);
      json(response, result.status, result.body);
      return;
    }
    if (resource === "payments" && request.method === "GET" && id) {
      const obligation = await obligations.get(tenantId, id);
      await assertClientAccess(identity, obligation.clientId);
      json(response, 200, await payments.list(tenantId, id));
      return;
    }
    if (
      resource === "payments" &&
      request.method === "POST" &&
      id &&
      path[4] === "validate"
    ) {
      const payment = await payments.get(tenantId, id);
      if (!payment) throw new Error("Pago no encontrado");
      const obligation = await obligations.get(tenantId, payment.obligationId);
      await assertClientAccess(identity, obligation.clientId);
      const result = await new PaymentController(payments).validate(
        tenantId,
        id,
      );
      if (result.status === 200) {
        const payment = result.body as { obligationId: string; amount: string };
        await obligations.applyValidatedPayment(
          tenantId,
          payment.obligationId,
          payment.amount,
        );
      }
      json(response, result.status, result.body);
      return;
    }
    if (
      resource === "payments" &&
      request.method === "POST" &&
      id &&
      path[4] === "reject"
    ) {
      const payment = await payments.get(tenantId, id);
      if (!payment) throw new Error("Pago no encontrado");
      const obligation = await obligations.get(tenantId, payment.obligationId);
      await assertClientAccess(identity, obligation.clientId);
      const input = await readBody(request);
      const result = await new PaymentController(payments).reject(
        tenantId,
        id,
        String(input.reason ?? ""),
      );
      json(response, result.status, result.body);
      return;
    }
    json(response, 404, { error: "Ruta no encontrada" });
  } catch (error) {
    if (error instanceof Error && error.message === "Autenticación requerida") {
      json(response, 401, {
        type: "https://httpstatuses.com/401",
        title: "Autenticación requerida",
        status: 401,
        detail: "Debe iniciar sesión para continuar.",
      });
      return;
    }
    const result = problemFromError(error);
    json(response, result.status, result);
  }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, "0.0.0.0", () =>
  console.log(`billing-workflow-service listening on ${port}`),
);
