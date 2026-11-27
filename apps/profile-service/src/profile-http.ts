import {
  BadRequestException,
  Body,
  Catch,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type {
  ArgumentsHost,
  CanActivate,
  ExceptionFilter,
  ExecutionContext,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import type {
  ProfileUpdate,
  UserProfile,
} from "../../../packages/contracts/profile.js";
import type {
  PeopleCreate,
  PeopleGroup,
  PeopleType,
  PeopleUpdate,
} from "../../../packages/contracts/people.js";

import type { IdentityContext } from "../../identity-sync-service/src/auth/identity-context.js";
import { authenticateHeaders } from "../../identity-sync-service/src/auth/request-authentication.js";
import { ClientContextController } from "./client-context/client-context.controller.js";
import { PeopleController } from "./people/people.controller.js";
import { MinioAvatarStorage } from "./profile/avatar-storage.adapter.js";
import { ProfileController } from "./profile/profile.controller.js";
import { maxAvatarBytes } from "./profile/profile.validation.js";

type AuthenticatedRequest = Request & { identity: IdentityContext };
type HttpResult = { status: number; body: unknown };
type AvatarFile = { originalname: string; mimetype: string; buffer: Buffer };

function send(response: Response, result: HttpResult) {
  response.setHeader("cache-control", "no-store");
  if (result.status === 204) response.status(204).end();
  else response.status(result.status).json(result.body);
}

@Injectable()
export class ProfileAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    try {
      request.identity = await authenticateHeaders(request.headers);
      return true;
    } catch {
      throw new UnauthorizedException("Autenticación requerida");
    }
  }
}

@Catch()
export class ProfileHttpFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const title =
      status === 401
        ? "Autenticación requerida"
        : status === 404
          ? "Ruta no encontrada"
          : status < 500
            ? "Solicitud inválida"
            : "Error interno";
    const detail =
      status === 404
        ? "La ruta solicitada no existe."
        : status < 500 && error instanceof Error
          ? error.message
          : "No se pudo completar la operación.";
    if (status >= 500) console.error(error);
    send(host.switchToHttp().getResponse<Response>(), {
      status,
      body: { type: "about:blank", title, status, detail },
    });
  }
}

// The application-level prefix is configured in main.ts. Keeping the
// controller unprefixed prevents exposing routes under /api/v1/api/v1.
@Controller()
@UseGuards(ProfileAuthGuard)
export class ProfileHttpController {
  constructor(
    @Inject(ProfileController) private readonly profile: ProfileController,
    @Inject(ClientContextController)
    private readonly context: ClientContextController,
    @Inject(PeopleController) private readonly people: PeopleController,
    @Inject(MinioAvatarStorage) private readonly storage: MinioAvatarStorage,
  ) {}

  @Get("profile")
  async getProfile(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    await this.sendProfile(response, await this.profile.get(request.identity));
  }

  @Patch("profile")
  @UseInterceptors(
    FileInterceptor("avatar", { limits: { fileSize: maxAvatarBytes + 1 } }),
  )
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Body() fields: Record<string, unknown>,
    @UploadedFile() avatar?: AvatarFile,
  ) {
    if (!request.is("multipart/form-data"))
      throw new BadRequestException(
        "El perfil debe enviarse como multipart/form-data.",
      );
    const update: ProfileUpdate = {};
    for (const key of ["firstName", "lastName", "alias"] as const) {
      const value = fields[key];
      if (value === undefined) continue;
      if (typeof value !== "string")
        throw new BadRequestException(`El campo ${key} debe ser texto.`);
      update[key] = value;
    }
    if (avatar) {
      update.avatar = {
        filename: avatar.originalname,
        mimeType: avatar.mimetype,
        bytes: avatar.buffer,
      };
    }
    await this.sendProfile(
      response,
      await this.profile.update(request.identity, update),
    );
  }

  @Patch("profile/password")
  async updatePassword(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Body() input: { password?: unknown; confirmation?: unknown },
  ) {
    if (typeof input.password !== "string" || input.password.length < 8)
      throw new BadRequestException(
        "La clave debe tener al menos 8 caracteres.",
      );
    if (input.password !== input.confirmation)
      throw new BadRequestException("Las claves no coinciden.");
    send(
      response,
      await this.profile.updatePassword(request.identity, input.password),
    );
  }

  @Get("client-context")
  async getClientContext(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const { clientId, tenantId, traceId, sub } = request.identity;
    const result = await this.context.get({ clientId, tenantId });
    console.info(
      JSON.stringify({
        event: "client_context_resolved",
        traceId,
        tenant_id: tenantId,
        userId: sub,
        client_id: clientId,
        status: result.status,
      }),
    );
    send(response, result);
  }

  @Get("people")
  async listPeople(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Query("type") type?: PeopleType,
    @Query("group") group?: unknown,
  ) {
    send(
      response,
      await this.people.list(
        request.identity,
        this.requiredType(type),
        this.optionalPeopleGroup(group),
      ),
    );
  }

  @Get("people/client-roles")
  async listClientRoles(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Query("group") group?: unknown,
  ) {
    send(
      response,
      await this.people.clientRoles(
        request.identity,
        this.optionalPeopleGroup(group),
      ),
    );
  }

  @Post("people")
  async createPerson(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Body() input: PeopleCreate,
  ) {
    send(response, await this.people.create(request.identity, input));
  }

  @Patch("people/:id")
  @UseInterceptors(
    FileInterceptor("avatar", { limits: { fileSize: maxAvatarBytes + 1 } }),
  )
  async updatePerson(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Param("id") id: string,
    @Body()
    input: Omit<PeopleUpdate, "enabled"> & { enabled?: boolean | string },
    @UploadedFile() avatar?: AvatarFile,
    @Query("type") type?: PeopleType,
  ) {
    const { enabled, ...fields } = input ?? {};
    if (
      enabled !== undefined &&
      enabled !== true &&
      enabled !== false &&
      enabled !== "true" &&
      enabled !== "false"
    )
      throw new BadRequestException("El estado del asociado no es válido.");
    send(
      response,
      await this.people.update(request.identity, id, this.requiredType(type), {
        ...fields,
        ...(enabled === undefined
          ? {}
          : { enabled: enabled === true || enabled === "true" }),
        ...(avatar
          ? {
              avatar: {
                filename: avatar.originalname,
                mimeType: avatar.mimetype,
                bytes: avatar.buffer,
              },
            }
          : {}),
      }),
    );
  }

  @Delete("people/:id")
  async deletePerson(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
    @Param("id") id: string,
    @Query("type") type?: PeopleType,
  ) {
    send(
      response,
      await this.people.delete(request.identity, id, this.requiredType(type)),
    );
  }

  private requiredType(type: PeopleType | undefined): PeopleType {
    if (!type)
      throw new BadRequestException("Faltan parámetros de la operación.");
    return type;
  }

  private optionalPeopleGroup(group: unknown): PeopleGroup | undefined {
    if (group === undefined || group === "associates" || group === "users")
      return group;
    throw new BadRequestException("El grupo de usuarios no es válido.");
  }

  private async sendProfile(response: Response, result: HttpResult) {
    if (result.status === 200) {
      const profile = result.body as UserProfile;
      if (profile.avatar)
        profile.avatarUrl = await this.storage.signedUrl(profile.avatar);
    }
    send(response, result);
  }
}
