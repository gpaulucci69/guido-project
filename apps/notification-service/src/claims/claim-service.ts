import { renderClaimTemplate } from "./claim-template.js";
export class ClaimService {
  manual(input: {
    clientName: string;
    email: string;
    amountDue: string;
    obligationDescription: string;
    dueDate: string;
    actionUrl: string;
    bcc?: string;
  }) {
    const rendered = renderClaimTemplate(input);
    return {
      to: input.email,
      ...(input.bcc ? { bcc: input.bcc } : {}),
      ...rendered,
    };
  }
}
