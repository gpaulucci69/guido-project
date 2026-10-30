export type ClaimTemplateInput = {
  clientName: string;
  obligationDescription: string;
  amountDue: string;
  dueDate: string;
  actionUrl: string;
};

export function renderClaimTemplate(input: ClaimTemplateInput): {
  subject: string;
  body: string;
} {
  return {
    subject: `Aviso de deuda pendiente - ${input.obligationDescription}`,
    body: [
      `Hola ${input.clientName},`,
      "",
      `Registramos un saldo pendiente de ARS ${input.amountDue} correspondiente a ${input.obligationDescription}.`,
      `Fecha de vencimiento: ${input.dueDate}.`,
      "",
      `Podés informar tu pago desde este enlace: ${input.actionUrl}`,
      "",
      "Saludos.",
    ].join("\n"),
  };
}
