export type MailMessage = {
  to: string;
  bcc?: string;
  subject: string;
  body: string;
};
export type MailTransport = { send(message: MailMessage): Promise<void> };

export class MailDispatcher {
  constructor(
    private readonly transport: MailTransport,
    private readonly retryDelayMs = 0,
  ) {}

  async sendWithRetry(message: MailMessage): Promise<{ attempts: number }> {
    let attempts = 0;
    while (attempts < 2) {
      attempts += 1;
      try {
        await this.transport.send(message);
        return { attempts };
      } catch (error) {
        if (attempts === 2) throw error;
        if (this.retryDelayMs > 0)
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelayMs),
          );
      }
    }
    return { attempts };
  }
}
