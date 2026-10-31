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
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";

const service = new ProfileService(
  new HttpKeycloakProfileAdapter(),
  new MinioAvatarStorage(),
  (event, context) =>
    console.info(JSON.stringify({ event, traceId: randomUUID(), ...context })),
);
const controller = new ProfileController(service);
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

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization,content-type",
      "access-control-allow-methods": "GET,PATCH,OPTIONS",
    });
    response.end();
    return;
  }
  if (isHealthPath(request.url)) {
    json(response, 200, healthResponse("profile-service"));
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
