export type FailureAlert = { id: string; message: string; createdAt: string; acknowledged: boolean };
export function spanishFailureAlert(alert: FailureAlert): string { return alert.acknowledged ? '' : `No se pudo enviar el reclamo: ${alert.message}`; }
