import type { ClientCreate, ClientStatus, ClientSummary, ClientUpdate } from "../../../../../packages/contracts/clients.js";
import { accessToken } from "../../auth/session";
import { createApiClient } from "../../lib/api/client";

const api = createApiClient({ baseUrl: `${window.location.protocol}//${window.location.hostname}:3002/api/v1`, getToken: accessToken });
export function listClients(type?: ClientCreate["type"]): Promise<{ items: ClientSummary[] }> {
  return api<{ items: ClientSummary[] }>(`/clients${type ? `?type=${type}` : ""}`);
}
export function createClient(input: ClientCreate): Promise<ClientSummary> {
  return api<ClientSummary>("/clients", { method: "POST", body: JSON.stringify(input) });
}
export function updateClient(id: string, input: ClientUpdate): Promise<ClientSummary> {
  return api<ClientSummary>(`/clients/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function updateClientStatus(id: string, status: ClientStatus): Promise<ClientSummary> {
  return api<ClientSummary>(`/clients/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}
