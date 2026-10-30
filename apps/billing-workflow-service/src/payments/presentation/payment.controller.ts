import { problemFromError } from "../../../../../packages/http/src/problem-details.js";
import type { PaymentService } from "../application/payment.service.js";
import type { ReportPaymentInput } from "../application/payment.service.js";
import type { CancelPaymentService } from "../application/cancel-payment.service.js";

export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  async cancel(
    cancelService: CancelPaymentService,
    input: { tenantId: string; paymentId: string; clientId: string; reason: string; userId: string },
  ) {
    try {
      return { status: 200, body: await cancelService.cancel(input.tenantId, input.paymentId, input.clientId, input.reason, input.userId) };
    } catch (error) {
      const status = error instanceof Error && error.message.includes("ya fue") ? 409 : 400;
      return { status, body: problemFromError(error) };
    }
  }

  async report(input: ReportPaymentInput) {
    try {
      return { status: 201, body: await this.service.report(input) };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }

  async list(tenantId: string, obligationId: string) {
    try {
      return {
        status: 200,
        body: await this.service.list(tenantId, obligationId),
      };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }

  async validate(tenantId: string, paymentId: string) {
    try {
      return {
        status: 200,
        body: await this.service.validate(tenantId, paymentId),
      };
    } catch (error) {
      return { status: 409, body: problemFromError(error) };
    }
  }

  async reject(tenantId: string, paymentId: string, reason: string) {
    try {
      return {
        status: 200,
        body: await this.service.reject(tenantId, paymentId, reason),
      };
    } catch (error) {
      return {
        status:
          error instanceof Error && error.message.includes("ya fue")
            ? 409
            : 400,
        body: problemFromError(error),
      };
    }
  }
}
