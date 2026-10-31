export type ClaimHistory = {
  id: string;
  obligationId: string;
  status: "SENT" | "FAILED";
  attempts: number;
  createdAt: string;
  error?: string;
};
export class ClaimHistoryStore {
  private readonly records: ClaimHistory[] = [];
  append(entry: ClaimHistory) {
    this.records.push(Object.freeze({ ...entry }));
  }
  list() {
    return this.records;
  }
}
