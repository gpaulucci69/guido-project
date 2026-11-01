import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import {
  healthResponse,
  isHealthPath,
} from "../../../packages/observability/src/health-controller.js";
import { MinioAvatarStorage } from "./profile/avatar-storage.adapter.js";
import { HttpKeycloakProfileAdapter } from "./profile/keycloak-profile.adapter.js";
import { ProfileService } from "./profile/profile.service.js";
import { ProfileController } from "./profile/profile.controller.js";
import type { UserProfile } from "../../../packages/contracts/profile.js";
import { ClientContextController } from "./client-context/client-context.controller.js";
import { ClientContextService } from "./client-context/client-context.service.js";
import { prisma } from "../../../packages/database/src/prisma-client.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { PeopleController } from "./people/people.controller.js";
import { PeopleService } from "./people/people.service.js";
import type { PeopleType } from "../../../packages/contracts/people.js";

const service = new ProfileService(
  new HttpKeycloakProfileAdapter(),
  new MinioAvatarStorage(),
  (event, context) =>
    console.info(JSON.stringify({ event, traceId: randomUUID(), ...context })),
);
const controller = new ProfileController(service);
const clientContextController = new ClientContextController(
  new ClientContextService(),
);
const peopleController = new PeopleController(new PeopleService());
const json = (
  response: import("node:http").ServerResponse,
  status: number,
  value: unknown,
) => {
  response.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization,content-type",
  });
  response.end(JSON.stringify(value));
};
async function readMultipart(request: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const contentType = String(request.headers["content-type"] ?? "");
  const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
  if (!boundary)
    throw new Error("El perfil debe enviarse como multipart/form-data.");
  const raw = Buffer.concat(chunks).toString("binary");
  const fields: Record<string, string> = {};
  let avatar:
    { filename: string; mimeType: string; bytes: Uint8Array } | undefined;
  for (const part of raw.split(`--${boundary}`).slice(1)) {
    const separator = part.indexOf("\r\n\r\n");
    if (separator < 0) continue;
    const headers = part.slice(0, separator);
    const value = part
      .slice(separator + 4)
      .replace(/\r\n--$/, "")
      .replace(/\r\n$/, "");
    const name = headers.match(/name="([^"]+)"/)?.[1];
    if (!name) continue;
    const filename = headers.match(/filename="([^"]*)"/)?.[1];
    if (filename)
      avatar = {
        filename,
        mimeType: headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] ?? "",
        bytes: Uint8Array.from(Buffer.from(value, "binary")),
      };
    else fields[name] = value;
  }
  return { ...fields, ...(avatar ? { avatar } : {}) };
}
async function readBody(
  request: import("node:http").IncomingMessage,
): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    });
    response.end();
    return;
  }
  if (isHealthPath(request.url)) {
    json(response, 200, healthResponse("profile-service"));
    return;
  }
  if (request.url === "/api/v1/client-context" && request.method === "GET") {
    try {
      const identity = await authenticateHeaders(request.headers);
      const tenant = await prisma.tenant.findUnique({
        where: { id: identity.tenantId },
        select: { clientId: true },
      });
      if (!tenant) throw new Error("tenant no encontrado");
      const result = await clientContextController.get({
        clientId: tenant.clientId,
        tenantId: identity.tenantId,
      });
      console.info(
        JSON.stringify({
          event: "client_context_resolved",
          traceId: randomUUID(),
          tenant_id: identity.tenantId,
          userId: identity.sub,
          client_id: tenant.clientId,
          status: result.status,
        }),
      );
      json(response, result.status, result.body);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Autenticación requerida";
      json(response, 401, {
        type: "about:blank",
        title: "Autenticación requerida",
        status: 401,
        detail,
      });
    }
    return;
  }
  if (
    request.url?.startsWith("/api/v1/people") &&
    ["GET", "POST", "PATCH", "DELETE"].includes(request.method ?? "")
  ) {
    try {
      const identity = await authenticateHeaders(request.headers);
      const parsed = new URL(request.url, "http://localhost");
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const id = pathParts[3];
      const type = parsed.searchParams.get("type") as PeopleType | null;
      let result;
      if (request.method === "GET" && type)
        result = await peopleController.list(identity, type);
      else if (request.method === "POST")
        result = await peopleController.create(
          identity,
          JSON.parse(await readBody(request)) as never,
        );
      else if (request.method === "PATCH" && id && type)
        result = await peopleController.update(
          identity,
          id,
          type,
          JSON.parse(await readBody(request)) as never,
        );
      else if (request.method === "DELETE" && id && type)
        result = await peopleController.delete(identity, id, type);
      else
        result = {
          status: 400,
          body: {
            type: "about:blank",
            title: "Solicitud inválida",
            status: 400,
            detail: "Faltan parámetros de la operación.",
          },
        };
      json(response, result.status, result.body);
    } catch (error) {
      json(response, 401, {
        type: "about:blank",
        title: "Autenticación requerida",
        status: 401,
        detail:
          error instanceof Error ? error.message : "Autenticación requerida",
      });
    }
    return;
  }
  if (
    request.url === "/api/v1/profile" &&
    (request.method === "GET" || request.method === "PATCH")
  ) {
    try {
      const identity = await authenticateHeaders(request.headers);
      const result =
        request.method === "GET"
          ? await controller.get(identity)
          : await controller.update(
              identity,
              (await readMultipart(request)) as never,
            );
      if (result.status === 200) {
        const profile = result.body as UserProfile;
        if (profile.avatar) {
          const avatarUrl = await new MinioAvatarStorage().signedUrl(
            profile.avatar,
          );
          profile.avatarUrl = avatarUrl;
        }
      }
      json(response, result.status, result.body);
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación.";
      const status = detail === "Autenticación requerida" ? 401 : 403;
      json(response, status, {
        type: "about:blank",
        title: status === 401 ? "Autenticación requerida" : "Acceso denegado",
        status,
        detail,
      });
    }
    return;
  }
  json(response, 404, {
    type: "about:blank",
    title: "Ruta no encontrada",
    status: 404,
    detail: "La ruta solicitada no existe.",
  });
});
server.listen(Number(process.env.PROFILE_PORT ?? 3001), "0.0.0.0");
