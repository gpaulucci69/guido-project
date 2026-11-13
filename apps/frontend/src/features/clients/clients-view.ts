import type { ClientStatus, ClientSummary } from "../../../../../packages/contracts/clients.js";
import type { FrontendPermission } from "../../auth/session";
import { canAction } from "../../auth/permission-evaluator";
import { listClients, updateClientStatus } from "./clients-api";
import { openClientForm } from "./client-form";

export async function renderClientsView(container: HTMLElement, permissions: readonly FrontendPermission[], onChanged: () => void): Promise<void> {
  container.innerHTML = '<section class="people-view"><div class="toolbar"><div><span class="eyebrow">GESTIÓN</span><h2>Clientes del estudio</h2></div><div><select id="client-type-filter" aria-label="Filtrar por tipo"><option value="">Todos</option><option value="INDIVIDUAL">Personas físicas</option><option value="LEGAL_ENTITY">Personas morales</option></select><button id="client-add">+ Nuevo cliente</button></div></div><div id="clients-state" class="panel"><p>Cargando...</p></div></section>';
  const state = container.querySelector<HTMLElement>("#clients-state");
  const render = async () => {
    try {
      const filter = container.querySelector<HTMLSelectElement>("#client-type-filter")?.value as "INDIVIDUAL" | "LEGAL_ENTITY" | "" | undefined;
      const result = await listClients(filter || undefined);
      if (state) state.innerHTML = result.items.length ? `<div class="table-scroll"><table><thead><tr><th>Tipo</th><th>Nombre</th><th>CUIT</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${result.items.map(row).join("")}</tbody></table></div>` : '<p class="empty">No hay clientes para mostrar.</p>';
      state?.querySelectorAll<HTMLButtonElement>("[data-status]").forEach((button) => button.addEventListener("click", async () => { await updateClientStatus(button.dataset.status ?? "", (button.dataset.next ?? "INACTIVE") as ClientStatus); await render(); onChanged(); }));
    } catch (error) { if (state) state.innerHTML = `<p class="result">${error instanceof Error ? error.message : "No se pudo cargar el listado."}</p>`; }
  };
  container.querySelector("#client-add")?.addEventListener("click", () => openClientForm({ onSaved: () => void render(), onClose: () => undefined }));
  container.querySelector("#client-type-filter")?.addEventListener("change", () => void render());
  await render();
  function row(client: ClientSummary): string { const next = client.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"; return `<tr><td>${client.type === "INDIVIDUAL" ? "Persona física" : "Persona moral"}</td><td>${escapeHtml(client.displayName)}</td><td>${escapeHtml(client.cuit)}</td><td>${client.status === "ACTIVE" ? "Activo" : "Inactivo"}</td><td>${canAction(permissions, "client/status") ? `<button type="button" class="link" data-status="${client.id}" data-next="${next}">${next === "ACTIVE" ? "Activar" : "Inactivar"}</button>` : ""}</td></tr>`; }
}
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char); }
