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
import { deletePerson, listPeople } from "./people-api";
import { openPeopleForm } from "./people-form";

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
      : "Contadores del estudio";
  container.innerHTML = `<section class="people-view"><div class="toolbar"><div><span class="eyebrow">GESTIÓN</span><h2>${title}</h2></div>${canAction(options.permissions, `${options.type}/add`) ? `<button id="people-add">+ Nuevo ${options.type === "client" ? "cliente" : "contador"}</button>` : ""}</div><div id="people-table-state" class="panel"><p>Cargando...</p></div></section>`;
  const state = container.querySelector<HTMLElement>("#people-table-state");
  try {
    const people = await listPeople(options.type);
    const columns: ColumnDef<AdministrableIdentity>[] = [
      { accessorKey: "firstName", header: "Nombre" },
      { accessorKey: "lastName", header: "Apellido" },
      { accessorKey: "alias", header: "Alias" },
      { accessorKey: "email", header: "Email" },
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
    const actions =
      canAction(options.permissions, `${options.type}/edit`) ||
      canAction(options.permissions, `${options.type}/delete`);
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
                        cell.column.id === "enabled"
                          ? value
                            ? "Activo"
                            : "Inactivo"
                          : String(value ?? "");
                      return `<td>${escapeHtml(display)}</td>`;
                    })
                    .join(
                      "",
                    )}${actions ? `<td class="people-actions">${canAction(options.permissions, `${options.type}/edit`) ? `<button class="link" data-edit="${row.original.id}">Editar</button>` : ""}${canAction(options.permissions, `${options.type}/delete`) ? `<button class="link danger" data-delete="${row.original.id}">Eliminar</button>` : ""}</td>` : ""}</tr>`,
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
      .querySelectorAll<HTMLButtonElement>("[data-delete]")
      .forEach((button) =>
        button.addEventListener("click", async () => {
          if (!window.confirm("¿Querés eliminar esta identidad?")) return;
          try {
            await deletePerson(button.dataset.delete ?? "", options.type);
            await options.onChanged();
          } catch (error) {
            window.alert(
              error instanceof Error
                ? error.message
                : "No se pudo eliminar la identidad.",
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
