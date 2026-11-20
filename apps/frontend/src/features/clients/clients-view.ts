import { createTable, getCoreRowModel, type ColumnDef } from "@tanstack/table-core";
import type { ClientStatus, ClientSummary } from "../../../../../packages/contracts/clients.js";
import type { FrontendPermission } from "../../auth/session";
import { canAction } from "../../auth/permission-evaluator";
import { listClients, updateClientStatus } from "./clients-api";
import { openClientForm } from "./client-form";

const editIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 3.3 3.3-.8L18.2 7.3a2.1 2.1 0 0 0-3-3L4 16.5Z"/><path d="m13.8 5.2 3 3"/></svg>';

export async function renderClientsView(container: HTMLElement, permissions: readonly FrontendPermission[], onChanged: () => void): Promise<void> {
  container.innerHTML = '<section class="people-view"><div class="toolbar"><div><span class="eyebrow">GESTIÓN</span><h2>Clientes del estudio</h2></div><div class="toolbar-actions"><label class="filter-control" for="client-type-filter"><span>Tipo de cliente</span><select id="client-type-filter" aria-label="Filtrar por tipo"><option value="">Todos</option><option value="INDIVIDUAL">Personas físicas</option><option value="LEGAL_ENTITY">Personas morales</option></select></label><button id="client-add">+ Nuevo cliente</button></div></div><div id="clients-state" class="panel"><p>Cargando...</p></div></section>';
  const state = container.querySelector<HTMLElement>("#clients-state");
  const render = async () => {
    try {
      const filter = container.querySelector<HTMLSelectElement>("#client-type-filter")?.value as "INDIVIDUAL" | "LEGAL_ENTITY" | "" | undefined;
      const result = await listClients(filter || undefined);
      const canEdit = canAction(permissions, "client/update");
      const canStatus = canAction(permissions, "client/status");
      const columns: ColumnDef<ClientSummary>[] = [
        { accessorKey: "type", header: "Tipo" },
        { accessorKey: "displayName", header: "Nombre" },
        { accessorKey: "cuit", header: "CUIT" },
        { accessorKey: "status", header: "Estado" },
      ];
      const table = createTable({ data: result.items, columns, getCoreRowModel: getCoreRowModel(), state: { columnPinning: { left: [], right: [] } }, onStateChange: () => undefined, renderFallbackValue: null });
      const headers = table.getHeaderGroups()[0]?.headers ?? [];
      const rows = table.getRowModel().rows;
      const hasActions = canEdit || canStatus;
      const headerHtml = headers.map((header) => `<th>${String(header.column.columnDef.header ?? "")}</th>`).join("");
      const bodyHtml = rows.length ? rows.map((row) => {
        const cells = row.getVisibleCells().map((cell) => {
          const value = cell.getValue();
          const display = cell.column.id === "type" ? (value === "INDIVIDUAL" ? "Persona física" : "Persona moral") : cell.column.id === "status" ? (value === "ACTIVE" ? "Activo" : "Inactivo") : String(value ?? "");
          return `<td>${escapeHtml(display)}</td>`;
        }).join("");
        const actions = hasActions ? `<td class="people-actions">${canEdit ? `<button class="link icon-action" type="button" data-edit="${row.original.id}" aria-label="Editar" title="Editar">${editIcon}</button>` : ""}${canStatus ? `<button class="link icon-action ${row.original.status === "ACTIVE" ? "danger" : ""}" type="button" data-status="${row.original.id}" data-next="${row.original.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}" aria-label="${row.original.status === "ACTIVE" ? "Inactivar" : "Activar"}" title="${row.original.status === "ACTIVE" ? "Inactivar" : "Activar"}">${row.original.status === "ACTIVE" ? "−" : "+"}</button>` : ""}</td>` : "";
        return `<tr>${cells}${actions}</tr>`;
      }).join("") : `<tr><td colspan="${columns.length + (hasActions ? 1 : 0)}" class="empty">No hay clientes para mostrar.</td></tr>`;
      if (state) state.innerHTML = `<div class="table-scroll"><table class="people-table"><thead><tr>${headerHtml}${hasActions ? "<th>Acciones</th>" : ""}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
      container.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((button) => button.addEventListener("click", () => {
        const client = result.items.find((item) => item.id === button.dataset.edit);
        if (client) openClientForm({ client, onSaved: () => { void render(); onChanged(); }, onClose: () => undefined });
      }));
      container.querySelectorAll<HTMLButtonElement>("[data-status]").forEach((button) => button.addEventListener("click", async () => {
        await updateClientStatus(button.dataset.status ?? "", (button.dataset.next ?? "INACTIVE") as ClientStatus);
        await render();
        onChanged();
      }));
    } catch (error) { if (state) state.innerHTML = `<p class="result">${escapeHtml(error instanceof Error ? error.message : "No se pudo cargar el listado.")}</p>`; }
  };
  container.querySelector("#client-add")?.addEventListener("click", () => openClientForm({ onSaved: () => void render(), onClose: () => undefined }));
  container.querySelector("#client-type-filter")?.addEventListener("change", () => void render());
  await render();
}

function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char); }
