import {
  createEvent,
  type EventEnvelope,
} from "../../../../../packages/events/src/envelope.js";

export type PaymentEvent = {
  paymentId: string;
  obligationId: string;
  status: "PENDING_VALIDATION" | "VALIDATED" | "REJECTED";
  amount: string;
  rejectionReason?: string;
};

export interface PaymentEventPublisher {
  publish(subject: string, event: EventEnvelope<PaymentEvent>): Promise<void>;
}

export class PaymentEvents {
  constructor(private readonly publisher: PaymentEventPublisher) {}

  reported(
    tenantId: string,
    traceId: string,
    payment: Omit<PaymentEvent, "status">,
  ) {
    return this.publish("billing.payment.reported", tenantId, traceId, {
      ...payment,
      status: "PENDING_VALIDATION",
    });
  }
  validated(
    tenantId: string,
    traceId: string,
    payment: Omit<PaymentEvent, "status">,
  ) {
    return this.publish("billing.payment.validated", tenantId, traceId, {
      ...payment,
      status: "VALIDATED",
    });
  }
  rejected(
    tenantId: string,
    traceId: string,
    payment: Omit<PaymentEvent, "status"> & { rejectionReason: string },
  ) {
    return this.publish("billing.payment.rejected", tenantId, traceId, {
      ...payment,
      status: "REJECTED",
    });
  }
  private publish(
    subject: string,
    tenantId: string,
    traceId: string,
    payload: PaymentEvent,
  ) {
    return this.publisher.publish(
      subject,
      createEvent(subject, tenantId, traceId, payload),
    );
  }
}
