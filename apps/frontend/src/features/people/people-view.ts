import {
  createTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/table-core";
import type {
  AdministrableIdentity,
  PeopleType,
} from "../../../../../packages/contracts/people.js";
import type { FrontendPermission } from "../../auth/session";
import { canAction } from "../../auth/permission-evaluator";
import { listPeople, updatePersonStatus } from "./people-api";
import { openPeopleForm } from "./people-form";

const actionIcons = {
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 3.3 3.3-.8L18.2 7.3a2.1 2.1 0 0 0-3-3L4 16.5Z"/><path d="m13.8 5.2 3 3"/></svg>',
  deactivate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/></svg>',
  activate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8M12 8v8"/></svg>',
};

export type PeopleViewOptions = {
  type: PeopleType;
  permissions: readonly FrontendPermission[];
  onChanged: () => Promise<void> | void;
};

export async function renderPeopleView(
  container: HTMLElement,
  options: PeopleViewOptions,
): Promise<void> {
  const title =
    options.type === "client"
      ? "Clientes del estudio"
      : "Asociados";
  container.innerHTML = `<section class="people-view"><div class="toolbar"><div><span class="eyebrow">GESTIÓN</span><h2>${title}</h2></div>${canAction(options.permissions, `${options.type}/add`) ? `<button id="people-add">+ Nuevo ${options.type === "client" ? "cliente" : "contador"}</button>` : ""}</div><div id="people-table-state" class="panel"><p>Cargando...</p></div></section>`;
  const state = container.querySelector<HTMLElement>("#people-table-state");
  try {
    const people = await listPeople(options.type);
    const columns: ColumnDef<AdministrableIdentity>[] = [
      ...(options.type === "user"
        ? [{ accessorKey: "avatarUrl", header: "Avatar" } satisfies ColumnDef<AdministrableIdentity>]
        : []),
      { accessorKey: "firstName", header: "Nombre" },
      { accessorKey: "lastName", header: "Apellido" },
      { accessorKey: "alias", header: "Alias" },
      { accessorKey: "email", header: "Email" },
      ...(options.type === "user"
        ? [{ accessorKey: "clientRole", header: "Rol" } satisfies ColumnDef<AdministrableIdentity>]
        : []),
      ...(options.type === "user"
        ? [
            { accessorKey: "startDate", header: "Ingreso" } satisfies ColumnDef<AdministrableIdentity>,
            { accessorKey: "birthDate", header: "Nacimiento" } satisfies ColumnDef<AdministrableIdentity>,
          ]
        : []),
      {
        accessorKey: "enabled",
        header: "Estado",
        cell: (info) => (info.getValue() ? "Activo" : "Inactivo"),
      },
    ];
    const table = createTable({
      data: people,
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: { columnPinning: { left: [], right: [] } },
      onStateChange: () => undefined,
      renderFallbackValue: null,
    });
    const headers = table.getHeaderGroups()[0]?.headers ?? [];
    const rows = table.getRowModel().rows;
    const canEdit = canAction(options.permissions, `${options.type}/edit`);
    const canUpdate = canAction(options.permissions, `${options.type}/update`);
    const canChangeStatus = canEdit && canUpdate;
    const actions = canEdit || canChangeStatus;
    if (actions)
      columns.push({ id: "actions", header: "Acciones", cell: () => "" });
    if (state)
      state.innerHTML = `<div class="table-scroll"><table class="people-table"><thead><tr>${headers.map((header) => `<th>${String(header.column.columnDef.header ?? "")}</th>`).join("")}${actions ? "<th>Acciones</th>" : ""}</tr></thead><tbody>${
        rows.length
          ? rows
              .map(
                (row) =>
                  `<tr>${row
                    .getVisibleCells()
                    .map((cell) => {
                      const value = cell.getValue();
                      const display =
                        cell.column.id === "avatarUrl"
                          ? row.original.avatarUrl
                            ? `<img class="people-avatar" src="${escapeHtml(row.original.avatarUrl)}" alt="" />`
                            : `<span class="people-avatar people-avatar-fallback" aria-label="Iniciales de ${escapeHtml(`${row.original.firstName} ${row.original.lastName}`)}">${escapeHtml(initials(row.original.firstName, row.original.lastName))}</span>`
                        : cell.column.id === "startDate" || cell.column.id === "birthDate"
                          ? formatDate(String(value ?? ""))
                          : cell.column.id === "enabled"
                          ? value
                            ? "Activo"
                            : "Inactivo"
                          : String(value ?? "");
                      return `<td>${cell.column.id === "avatarUrl" ? display : escapeHtml(display)}</td>`;
                    })
                    .join(
                      "",
                    )}${actions ? `<td class="people-actions">${canEdit ? `<button class="link icon-action" type="button" data-edit="${row.original.id}" aria-label="Editar" title="Editar">${actionIcons.edit}</button>` : ""}${canChangeStatus ? `<button class="link icon-action ${row.original.enabled ? "danger" : ""}" type="button" data-status="${row.original.id}" data-enabled="${row.original.enabled}" aria-label="${row.original.enabled ? "Inactivar" : "Activar"}" title="${row.original.enabled ? "Inactivar" : "Activar"}">${row.original.enabled ? actionIcons.deactivate : actionIcons.activate}</button>` : ""}</td>` : ""}</tr>`,
              )
              .join("")
          : `<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="empty">No hay registros para mostrar.</td></tr>`
      }</tbody></table></div>`;
    container.querySelector("#people-add")?.addEventListener("click", () =>
      openPeopleForm({
        type: options.type,
        permissions: options.permissions,
        onSaved: options.onChanged,
        onClose: () => undefined,
      }),
    );
    container
      .querySelectorAll<HTMLButtonElement>("[data-edit]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          const person = people.find((item) => item.id === button.dataset.edit);
          if (person)
            openPeopleForm({
              type: options.type,
              permissions: options.permissions,
              person,
              onSaved: options.onChanged,
              onClose: () => undefined,
            });
        }),
      );
    container
      .querySelectorAll<HTMLButtonElement>("[data-status]")
      .forEach((button) =>
        button.addEventListener("click", async () => {
          const enabled = button.dataset.enabled === "true";
          const action = enabled ? "Inactivar" : "Activar";
          const nextEnabled = !enabled;
          if (
            !window.confirm(`¿Querés ${action.toLowerCase()} esta identidad?`)
          )
            return;
          try {
            await updatePersonStatus(
              button.dataset.status ?? "",
              options.type,
              nextEnabled,
            );
            await options.onChanged();
          } catch (error) {
            window.alert(
              error instanceof Error
                ? error.message
                : `No se pudo ${action.toLowerCase()} la identidad.`,
            );
          }
        }),
      );
  } catch (error) {
    if (state)
      state.innerHTML = `<p class="result">${escapeHtml(error instanceof Error ? error.message : "No se pudo cargar el listado.")}</p>`;
  }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );
}

function formatDate(value: string): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";
}
