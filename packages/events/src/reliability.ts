export type DeadLetter<T> = {
  event: T;
  error: string;
  failedAt: string;
  attempts: number;
};
export class IdempotentConsumer {
  private readonly processed = new Set<string>();
  readonly deadLetters: DeadLetter<unknown>[] = [];
  async consume<T extends { eventId: string }>(
    event: T,
    handler: (event: T) => Promise<void>,
  ): Promise<"processed" | "duplicate"> {
    if (this.processed.has(event.eventId)) return "duplicate";
    try {
      await handler(event);
      this.processed.add(event.eventId);
      return "processed";
    } catch (error) {
      this.deadLetters.push({
        event,
        error: error instanceof Error ? error.message : "Error desconocido",
        failedAt: new Date().toISOString(),
        attempts: 1,
      });
      throw error;
    }
  }
}
