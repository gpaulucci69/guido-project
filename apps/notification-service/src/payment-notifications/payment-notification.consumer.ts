export type PaymentNotificationEvent = {
  type:
    | "billing.payment.reported"
    | "billing.payment.validated"
    | "billing.payment.rejected";
  recipient: string;
  amount: string;
  reason?: string;
};
export type NotificationMessage = { to: string; subject: string; body: string };
export class PaymentNotificationConsumer {
  consume(event: PaymentNotificationEvent): NotificationMessage {
    const subject =
      event.type === "billing.payment.reported"
        ? "Nueva rendición de pago"
        : event.type === "billing.payment.validated"
          ? "Pago validado"
          : "Rendición de pago rechazada";
    const reason = event.reason ? ` Motivo: ${event.reason}.` : "";
    return {
      to: event.recipient,
      subject,
      body: `Se registró un pago de ARS ${event.amount}.${reason}`,
    };
  }
}
