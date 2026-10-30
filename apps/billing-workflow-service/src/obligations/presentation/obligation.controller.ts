import {
  problemFromError,
  type ProblemDetails,
} from "../../../../../packages/http/src/problem-details.js";
import type {
  CreateObligationInput,
  ObligationStatus,
} from "../domain/obligation.js";
import { ObligationService } from "../application/obligation.service.js";

export type HttpResult<T> = { status: number; body: T };

export class ObligationController {
  constructor(private readonly service: ObligationService) {}

  async create(
    input: Omit<CreateObligationInput, "id">,
  ): Promise<HttpResult<unknown>> {
    try {
      return { status: 201, body: await this.service.create(input) };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }

  async list(
    tenantId: string,
    query: {
      clientId?: string;
      status?: ObligationStatus;
      cursor?: string;
      limit?: number;
    },
  ): Promise<HttpResult<unknown>> {
    try {
      return {
        status: 200,
        body: await this.service.list({ ...query, tenantId }),
      };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }

  async detail(tenantId: string, id: string): Promise<HttpResult<unknown>> {
    try {
      return { status: 200, body: await this.service.get(tenantId, id) };
    } catch (error) {
      return { status: 404, body: problemFromError(error) as ProblemDetails };
    }
  }

  async cancel(
    tenantId: string,
    id: string,
    reason: string,
  ): Promise<HttpResult<unknown>> {
    try {
      return {
        status: 200,
        body: await this.service.cancel(tenantId, id, reason),
      };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }
}
