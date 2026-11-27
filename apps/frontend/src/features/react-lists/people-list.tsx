import { Modal } from "../../components/ui-states.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/table-core";
import { useEffect, useMemo, useState } from "react";
import { RowActionButton } from "../../components/row-action-button.js";
import {
  belongsToPeopleGroup,
  isAssociateRole,
  personRoles,
  type AdministrableIdentity,
  type PeopleGroup,
} from "../../../../../packages/contracts/people.js";
import {
  createPerson,
  listClientRoles,
  listPeople,
  updatePerson,
  updatePersonStatus,
} from "../people/people-api.js";
import type { FrontendPermission } from "../../auth/session.js";
import { canAction } from "../../auth/permission-evaluator.js";
import { initials } from "../../auth/profile-normalization.js";
import { formatDate, formatDateTime } from "../../lib/formatters/date.js";
import { ErrorState, LoadingState } from "../../components/ui-states.js";

type FormState = {
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  clientRole: string;
  startDate: string;
  birthDate: string;
  enabled: boolean;
  avatar?: File;
};
const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  alias: "",
  email: "",
  clientRole: "",
  startDate: "",
  birthDate: "",
  enabled: true,
};

export function PeopleList({
  group,
  permissions,
}: {
  group: PeopleGroup;
  permissions: readonly FrontendPermission[];
}) {
  const isAssociates = group === "associates";
  const singular = isAssociates ? "asociado" : "usuario";
  const plural = `${singular}s`;
  const title = isAssociates ? "Asociados" : "Usuarios";
  const canAdd = canAction(permissions, "user/add");
  const canEdit =
    canAction(permissions, "user/edit") &&
    canAction(permissions, "user/update");
  const canStatus = canEdit;
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdministrableIdentity | null>();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["people", "user", group],
    queryFn: () => listPeople("user", group),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updatePersonStatus(id, "user", enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["people", "user"] }),
  });
  const items = useMemo(
    () =>
      (query.data ?? []).filter((person) => {
        return (
          belongsToPeopleGroup(person, group) &&
          `${person.firstName} ${person.lastName} ${person.email} ${personRoles(person).join(" ")}`
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase())
        );
      }),
    [group, query.data, search],
  );
  const columns: ColumnDef<AdministrableIdentity>[] = [
    { accessorKey: "avatarUrl", header: "Avatar" },
    { accessorKey: "firstName", header: "Nombre" },
    { accessorKey: "lastName", header: "Apellido" },
    {
      id: "clientRole",
      accessorFn: (person) => personRoles(person).join(", "),
      header: "Rol",
    },
    { accessorKey: "startDate", header: "Ingreso" },
    { accessorKey: "birthDate", header: "Nacimiento" },
    { accessorKey: "enabled", header: "Estado" },
  ];
  if (!isAssociates) {
    columns.push(
      {
        accessorFn: (person) => person.email || "—",
        id: "email",
        header: "Email",
      },
      {
        accessorFn: (person) => formatDateTime(person.lastLoginAt),
        id: "lastLoginAt",
        header: "Último acceso",
      },
    );
  }
  const table = createTable({
    data: items,
    getRowId: (row) => row.id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnPinning: { left: [], right: [] } },
    onStateChange: () => undefined,
    renderFallbackValue: null,
  });
  if (query.isLoading) return <LoadingState label={`Cargando ${plural}…`} />;
  if (query.isError)
    return (
      <ErrorState message={`No se pudo cargar el listado de ${plural}.`} />
    );
  return (
    <section className="people-view">
      <div className="toolbar">
        <div>
          <span className="eyebrow">GESTIÓN</span>
          <h2>{title}</h2>
        </div>
        {canAdd && (
          <button type="button" onClick={() => setEditing(null)}>
            + Nuevo {singular}
          </button>
        )}
      </div>
      <div className="list-filters" aria-label={`Filtros de ${plural}`}>
        <label>
          Buscar
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, correo o rol"
          />
        </label>
      </div>
      {statusMutation.isError && (
        <p role="alert">No se pudo actualizar el estado del {singular}.</p>
      )}
      <div className="panel table-scroll">
        <table className="people-table">
          <thead>
            <tr>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <th key={header.id}>
                  {String(header.column.columnDef.header)}
                </th>
              ))}
              {(canEdit || canStatus) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {cell.column.id === "avatarUrl" ? (
                        row.original.avatarUrl ? (
                          <img
                            className="people-avatar"
                            src={row.original.avatarUrl}
                            alt=""
                          />
                        ) : (
                          <span className="people-avatar people-avatar-fallback">
                            {initials(row.original)}
                          </span>
                        )
                      ) : cell.column.id === "startDate" ||
                        cell.column.id === "birthDate" ? (
                        formatDate(String(cell.getValue() ?? ""))
                      ) : cell.column.id === "enabled" ? (
                        cell.getValue() ? (
                          "Activo"
                        ) : (
                          "Inactivo"
                        )
                      ) : (
                        String(cell.getValue() ?? "—")
                      )}
                    </td>
                  ))}
                  {(canEdit || canStatus) && (
                    <td className="people-actions">
                      {canEdit && (
                        <RowActionButton
                          action="edit"
                          onClick={() => setEditing(row.original)}
                        />
                      )}
                      {canStatus && (
                        <RowActionButton
                          action={
                            row.original.enabled ? "deactivate" : "activate"
                          }
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: row.original.id,
                              enabled: !row.original.enabled,
                            })
                          }
                        />
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + Number(canEdit || canStatus)}
                  className="empty"
                >
                  No hay {plural} para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing !== undefined && (editing ? canEdit : canAdd) && (
        <PeopleModal
          group={group}
          singular={singular}
          person={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            void queryClient.invalidateQueries({
              queryKey: ["people", "user"],
            });
          }}
        />
      )}
    </section>
  );
}

function PeopleModal({
  group,
  singular,
  person,
  onClose,
  onSaved,
}: {
  group: PeopleGroup;
  singular: "asociado" | "usuario";
  person: AdministrableIdentity | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    ...(person
      ? {
          firstName: person.firstName,
          lastName: person.lastName,
          alias: person.alias,
          email: person.email,
          clientRole: person.clientRole ?? "",
          startDate: person.startDate ?? "",
          birthDate: person.birthDate ?? "",
          enabled: person.enabled,
        }
      : {}),
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void listClientRoles(group)
      .then((result) => setRoles(result.items))
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudieron cargar los client roles.",
        ),
      );
  }, [group]);
  const roleOptions = person
    ? roles
    : roles.filter(
        (role) => isAssociateRole(role) === (singular === "asociado"),
      );
  const set = (
    key: keyof FormState,
    value: string | boolean | File | undefined,
  ) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { avatar, enabled, clientRole, ...fields } = form;
      if (person)
        await updatePerson(person.id, "user", {
          ...fields,
          enabled,
          ...(clientRole !== (person.clientRole ?? "") ? { clientRole } : {}),
          ...(avatar ? { avatar } : {}),
        });
      else await createPerson({ type: "user", ...fields, clientRole });
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `No se pudo guardar el ${singular}.`,
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={`${person ? "Editar" : "Nuevo"} ${singular}`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label>
          Nombre
          <input
            required
            value={form.firstName}
            onChange={(event) => set("firstName", event.target.value)}
          />
        </label>
        <label>
          Apellido
          <input
            required
            value={form.lastName}
            onChange={(event) => set("lastName", event.target.value)}
          />
        </label>
        <label>
          Alias
          <input
            value={form.alias}
            onChange={(event) => set("alias", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </label>
        <label className="modal-select-field">
          Rol
          <select
            required={!person}
            value={form.clientRole}
            onChange={(event) => set("clientRole", event.target.value)}
          >
            <option value="">{person ? "Sin rol" : "Seleccioná un rol"}</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ingreso
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => set("startDate", event.target.value)}
          />
        </label>
        <label>
          Nacimiento
          <input
            type="date"
            value={form.birthDate}
            onChange={(event) => set("birthDate", event.target.value)}
          />
        </label>
        {person && (
          <label>
            Avatar
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => set("avatar", event.target.files?.[0])}
            />
          </label>
        )}
        {person && (
          <label className="modal-select-field">
            Estado
            <select
              value={String(form.enabled)}
              onChange={(event) =>
                set("enabled", event.target.value === "true")
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>
        )}
        {error && (
          <p role="alert" className="modal-message">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : person ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
