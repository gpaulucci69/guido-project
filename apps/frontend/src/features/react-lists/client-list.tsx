import { Modal } from "../../components/ui-states.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/table-core";
import { useMemo, useState } from "react";
import { RowActionButton } from "../../components/row-action-button.js";
import type {
  ClientCreate,
  ClientStatus,
  ClientSummary,
} from "../../../../../packages/contracts/clients.js";
import {
  createClient,
  listClients,
  updateClient,
  updateClientStatus,
} from "../clients/clients-api.js";
import type { FrontendPermission } from "../../auth/session.js";
import { canAction } from "../../auth/permission-evaluator.js";
import { ErrorState, LoadingState } from "../../components/ui-states.js";

type FormState = {
  type: ClientCreate["type"];
  firstName: string;
  lastName: string;
  legalName: string;
  tradeName: string;
  cuit: string;
  email: string;
  legalRepresentativeName: string;
  legalRepresentativeTaxId: string;
};
const emptyForm: FormState = {
  type: "INDIVIDUAL",
  firstName: "",
  lastName: "",
  legalName: "",
  tradeName: "",
  cuit: "",
  email: "",
  legalRepresentativeName: "",
  legalRepresentativeTaxId: "",
};

export function ClientList({
  permissions,
}: {
  permissions: readonly FrontendPermission[];
}) {
  const canAdd = canAction(permissions, "client/add");
  const canEdit = canAction(permissions, "client/update");
  const canStatus = canAction(permissions, "client/status");
  const [type, setType] = useState<"ALL" | "INDIVIDUAL" | "LEGAL_ENTITY">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ClientSummary | null | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["clients"],
    queryFn: () => listClients(),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClientStatus }) =>
      updateClientStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
  const items = useMemo(
    () =>
      (query.data?.items ?? []).filter(
        (client) =>
          (type === "ALL" || client.type === type) &&
          `${client.displayName} ${client.cuit}`
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
      ),
    [query.data, search, type],
  );
  const columns: ColumnDef<ClientSummary>[] = [
    { accessorKey: "type", header: "Tipo" },
    { accessorKey: "displayName", header: "Nombre" },
    { accessorKey: "cuit", header: "CUIT" },
    { accessorKey: "status", header: "Estado" },
  ];
  const table = createTable({
    data: items,
    getRowId: (row) => row.id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnPinning: { left: [], right: [] } },
    onStateChange: () => undefined,
    renderFallbackValue: null,
  });
  if (query.isLoading) return <LoadingState label="Cargando clientes…" />;
  if (query.isError)
    return <ErrorState message="No se pudo cargar el listado de clientes." />;
  return (
    <section className="people-view">
      <div className="toolbar">
        <div>
          <span className="eyebrow">GESTIÓN</span>
          <h2>Clientes del estudio</h2>
        </div>
        {canAdd && (
          <button type="button" onClick={() => setEditing(null)}>
            + Nuevo cliente
          </button>
        )}
      </div>
      <div className="list-filters" aria-label="Filtros de clientes">
        <label>
          Buscar
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o CUIT"
          />
        </label>
        <label>
          Tipo
          <select
            value={type}
            onChange={(event) => setType(event.target.value as typeof type)}
          >
            <option value="ALL">Todos</option>
            <option value="INDIVIDUAL">Persona física</option>
            <option value="LEGAL_ENTITY">Persona moral</option>
          </select>
        </label>
      </div>
      {statusMutation.isError && (
        <p role="alert">No se pudo actualizar el estado del cliente.</p>
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
                      {cell.column.id === "type"
                        ? cell.getValue() === "INDIVIDUAL"
                          ? "Persona física"
                          : "Persona moral"
                        : cell.column.id === "status"
                          ? cell.getValue() === "ACTIVE"
                            ? "Activo"
                            : "Inactivo"
                          : String(cell.getValue() ?? "")}
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
                            row.original.status === "ACTIVE"
                              ? "deactivate"
                              : "activate"
                          }
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: row.original.id,
                              status:
                                row.original.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
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
                  No hay clientes para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing !== undefined && (editing ? canEdit : canAdd) && (
        <ClientModal
          client={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            void queryClient.invalidateQueries({ queryKey: ["clients"] });
          }}
        />
      )}
    </section>
  );
}

function ClientModal({
  client,
  onClose,
  onSaved,
}: {
  client: ClientSummary | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    ...(client
      ? {
          type: client.type,
          firstName: client.firstName ?? "",
          lastName: client.lastName ?? "",
          legalName: client.legalName ?? "",
          tradeName: client.tradeName ?? "",
          cuit: client.cuit,
          email: client.email ?? "",
          legalRepresentativeName: client.legalRepresentativeName ?? "",
          legalRepresentativeTaxId: client.legalRepresentativeTaxId ?? "",
        }
      : {}),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const contact = { email: form.email };
      const individualFields = {
        firstName: form.firstName,
        lastName: form.lastName,
      };
      const legalFields = {
        legalName: form.legalName,
        tradeName: form.tradeName,
        legalRepresentativeName: form.legalRepresentativeName,
        legalRepresentativeTaxId: form.legalRepresentativeTaxId,
      };
      if (client)
        await updateClient(client.id, {
          ...contact,
          ...(client.type === "INDIVIDUAL" ? individualFields : legalFields),
          updatedAt: client.updatedAt,
        });
      else {
        const common = { ...contact, cuit: form.cuit };
        await createClient(
          form.type === "INDIVIDUAL"
            ? { ...common, ...individualFields, type: "INDIVIDUAL" }
            : { ...common, ...legalFields, type: "LEGAL_ENTITY" },
        );
      }
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el cliente.",
      );
    } finally {
      setSaving(false);
    }
  }
  const individual = form.type === "INDIVIDUAL";
  return (
    <Modal
      title={client ? "Editar cliente" : "Nuevo cliente"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <label className="modal-select-field">
          Tipo
          <select
            value={form.type}
            disabled={Boolean(client)}
            onChange={(event) => set("type", event.target.value)}
          >
            <option value="INDIVIDUAL">Persona física</option>
            <option value="LEGAL_ENTITY">Persona moral</option>
          </select>
        </label>
        {individual ? (
          <>
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
          </>
        ) : (
          <>
            <label>
              Razón social
              <input
                required
                value={form.legalName}
                onChange={(event) => set("legalName", event.target.value)}
              />
            </label>
            <label>
              Nombre comercial
              <input
                value={form.tradeName}
                onChange={(event) => set("tradeName", event.target.value)}
              />
            </label>
            <label>
              Representante legal
              <input
                value={form.legalRepresentativeName}
                onChange={(event) =>
                  set("legalRepresentativeName", event.target.value)
                }
              />
            </label>
            <label>
              CUIT representante
              <input
                value={form.legalRepresentativeTaxId}
                onChange={(event) =>
                  set("legalRepresentativeTaxId", event.target.value)
                }
              />
            </label>
          </>
        )}
        <label>
          CUIT
          <input
            required
            disabled={Boolean(client)}
            value={form.cuit}
            onChange={(event) => set("cuit", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </label>
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
            {saving ? "Guardando…" : client ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
