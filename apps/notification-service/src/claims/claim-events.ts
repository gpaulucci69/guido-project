import {
  createEvent,
  type EventEnvelope,
} from "../../../../packages/events/src/envelope.js";

export type ClaimEvent = {
  claimId: string;
  obligationId: string;
  recipientEmail: string;
  attemptCount: number;
  errorMessage?: string;
};
export type ClaimEventPublisher = {
  publish(subject: string, event: EventEnvelope<ClaimEvent>): Promise<void>;
};

export class ClaimEvents {
  constructor(private readonly publisher: ClaimEventPublisher) {}
  triggered(
    tenantId: string,
    traceId: string,
    payload: Omit<ClaimEvent, "errorMessage">,
  ) {
    return this.publisher.publish(
      "billing.claim.triggered",
      createEvent("billing.claim.triggered", tenantId, traceId, payload),
    );
  }
  failed(
    tenantId: string,
    traceId: string,
    payload: ClaimEvent & { errorMessage: string },
  ) {
    return this.publisher.publish(
      "billing.claim.failed",
      createEvent("billing.claim.failed", tenantId, traceId, payload),
    );
  }
}
