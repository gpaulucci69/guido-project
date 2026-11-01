import type {
  ClientContextIdentity,
  ClientContextService,
} from "./client-context.service.js";

export class ClientContextController {
  constructor(private readonly service: ClientContextService) {}

  async get(identity: ClientContextIdentity) {
    try {
      return { status: 200, body: await this.service.get(identity) };
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "No se pudo resolver el contexto del cliente.";
      const status = detail.includes("no disponible") ? 502 : 403;
      return {
        status,
        body: {
          type: `https://httpstatuses.com/${status}`,
          title: status === 502 ? "Servicio no disponible" : "Acceso denegado",
          status,
          detail,
        },
      };
    }
  }
}
