import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { isHealthPath, healthResponse } from "../../../packages/observability/src/health-controller.js";
import { forbiddenProblem, problemFromError } from "../../../packages/http/src/problem-details.js";
import { prisma } from "../../../packages/database/src/prisma-client.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { ClientPermissionError, requireClientPermission } from "./clients/client.authorization.js";
import type { ClientCreate, ClientStatus, ClientType, ClientUpdate } from "../../../packages/contracts/clients.js";
import { validateCreate, validateType, validateUpdate } from "./clients/client.validation.js";
import { Prisma, type AccountingClient } from "@prisma/client";

function json(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type" });
  response.end(JSON.stringify(value));
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function visibleName(client: { type: ClientType; firstName?: string | null | undefined; lastName?: string | null | undefined; legalName?: string | null | undefined }): string {
  return client.type === "INDIVIDUAL" ? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() : client.legalName ?? "";
}

function summary(client: AccountingClient) {
  return { ...client, displayName: visibleName(client), status: client.status as ClientStatus, updatedAt: client.updatedAt.toISOString() };
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") { json(response, 204, null); return; }
  if (isHealthPath(request.url)) { json(response, 200, healthResponse("accounting-client-service")); return; }
  if (!request.url?.startsWith("/api/v1/clients")) { json(response, 404, { detail: "Ruta no encontrada." }); return; }
  try {
    const identity = await authenticateHeaders(request.headers);
    requireClientPermission(identity, "view");
    const parsed = new URL(request.url, "http://localhost");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = parts[3];
    if (request.method === "GET" && !id) {
      const typeParam = parsed.searchParams.get("type");
      const type = typeParam ? validateType(typeParam) : undefined;
      const clients = await prisma.accountingClient.findMany({ where: { tenantId: identity.tenantId, ...(type ? { type } : {}) }, orderBy: { businessName: "asc" } });
      json(response, 200, { items: clients.map(summary) });
      return;
    }
    if (request.method === "POST" && !id) {
      requireClientPermission(identity, "add");
      const input = validateCreate(await body(request) as ClientCreate);
      const created = await prisma.accountingClient.create({ data: { tenantId: identity.tenantId, businessName: input.type === "INDIVIDUAL" ? `${input.firstName} ${input.lastName}` : input.legalName, cuit: input.cuit, email: input.email ?? "", phone: input.phone ?? null, type: input.type, firstName: input.type === "INDIVIDUAL" ? input.firstName : null, lastName: input.type === "INDIVIDUAL" ? input.lastName : null, legalName: input.type === "LEGAL_ENTITY" ? input.legalName : null, tradeName: input.type === "LEGAL_ENTITY" ? input.tradeName ?? null : null, taxAddress: input.taxAddress ?? null, legalRepresentativeName: input.type === "LEGAL_ENTITY" ? input.legalRepresentativeName ?? null : null, legalRepresentativeTaxId: input.type === "LEGAL_ENTITY" ? input.legalRepresentativeTaxId ?? null : null } });
      json(response, 201, summary(created));
      return;
    }
    if (request.method === "PATCH" && id && parts[4] === "status") {
      requireClientPermission(identity, "status");
      const input = await body(request);
      const status = input.status === "ACTIVE" || input.status === "INACTIVE" ? input.status : undefined;
      if (!status) throw new Error("El estado del cliente no es válido.");
      const updated = await prisma.accountingClient.updateMany({ where: { id, tenantId: identity.tenantId }, data: { status } });
      if (updated.count !== 1) throw new Error("Cliente no encontrado.");
      const client = await prisma.accountingClient.findFirstOrThrow({ where: { id, tenantId: identity.tenantId } });
      json(response, 200, summary(client));
      return;
    }
    if (request.method === "PATCH" && id) {
      requireClientPermission(identity, "update");
      const validated = validateUpdate(await body(request) as ClientUpdate);
      const input = Object.fromEntries(Object.entries(validated).filter(([, value]) => value !== undefined)) as ClientUpdate;
      const current = await prisma.accountingClient.findFirst({ where: { id, tenantId: identity.tenantId } });
      if (!current) throw new Error("Cliente no encontrado.");
      if (current.updatedAt.toISOString() !== input.updatedAt) throw new Error("El cliente fue modificado. Recargá la información e intentá nuevamente.");
      const merged = { ...current, ...input };
      validateCreate(Object.fromEntries(Object.entries(merged).filter(([, value]) => value !== null)) as ClientCreate);
      const updated = await prisma.accountingClient.updateMany({ where: { id, tenantId: identity.tenantId, updatedAt: current.updatedAt }, data: { businessName: visibleName({ ...current, ...input }), ...(input.firstName !== undefined ? { firstName: input.firstName } : {}), ...(input.lastName !== undefined ? { lastName: input.lastName } : {}), ...(input.legalName !== undefined ? { legalName: input.legalName } : {}), ...(input.tradeName !== undefined ? { tradeName: input.tradeName } : {}), ...(input.email !== undefined ? { email: input.email } : {}), ...(input.phone !== undefined ? { phone: input.phone } : {}), ...(input.taxAddress !== undefined ? { taxAddress: input.taxAddress } : {}), ...(input.legalRepresentativeName !== undefined ? { legalRepresentativeName: input.legalRepresentativeName } : {}), ...(input.legalRepresentativeTaxId !== undefined ? { legalRepresentativeTaxId: input.legalRepresentativeTaxId } : {}) } });
      if (updated.count !== 1) throw new Error("El cliente fue modificado. Recargá la información e intentá nuevamente.");
      const client = await prisma.accountingClient.findFirstOrThrow({ where: { id, tenantId: identity.tenantId } });
      json(response, 200, summary(client));
      return;
    }
    json(response, 404, { detail: "Ruta no encontrada." });
  } catch (error) {
    if (error instanceof ClientPermissionError) {
      json(response, 403, forbiddenProblem());
      return;
    }
    const result = isDuplicateCuitError(error)
      ? {
          type: "https://httpstatuses.com/409",
          title: "Cliente ya registrado",
          status: 409,
          detail:
            "Ya existe un cliente con ese CUIT en este estudio. Verificá el CUIT o editá el cliente existente.",
        }
      : problemFromError(error);
    json(response, result.status, result);
  }
});

function isDuplicateCuitError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("cuit")
  );
}

server.listen(Number(process.env.PORT ?? 3002), "0.0.0.0", () => console.log("accounting-client-service listening"));
