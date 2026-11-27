import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createApiClient } from "../../lib/api/client.js";
import { accessToken, type FrontendPermission } from "../../auth/session.js";
import { canAction } from "../../auth/permission-evaluator.js";
import {
  toObligationRow,
  type ObligationRow,
} from "../obligations/obligation-view.js";
import { ErrorState, LoadingState, Modal } from "../../components/ui-states.js";
import { PaymentHistory } from "../payments/payment-history.js";
import { listClients } from "../clients/clients-api.js";
import { formatDate } from "../../lib/formatters/date.js";

const api = createApiClient({
  baseUrl: `${window.location.protocol}//${window.location.hostname}:3000/api/v1`,
  getToken: accessToken,
});

export function ObligationList({
  permissions,
}: {
  permissions: readonly FrontendPermission[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<ObligationRow | null>(
    null,
  );
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["obligations"],
    queryFn: () => api<{ items: ObligationRow[] }>("/obligations"),
  });
  const createMutation = useMutation({
    mutationFn: (input: Record<string, string>) =>
      api("/obligations", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      setMessage("Obligación creada correctamente.");
      setFormOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["obligations"] });
    },
    onError: (error) =>
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear la obligación.",
      ),
  });
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api(`/obligations/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      setMessage("Obligación cancelada correctamente.");
      setCancelId(null);
      void queryClient.invalidateQueries({ queryKey: ["obligations"] });
    },
    onError: (error) =>
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la obligación.",
      ),
  });
  if (query.isLoading)
    return <LoadingState label="Cargando estado de cuenta…" />;
  if (query.isError)
    return <ErrorState message="No se pudo cargar el estado de cuenta." />;
  const items = query.data?.items ?? [];
  const canAdd = canAction(permissions, "add/customer");
  const canCancel = canAction(permissions, "cancel/obligation");
  return (
    <section className="people-view">
      <div className="toolbar">
        <div>
          <span className="eyebrow">CUENTA</span>
          <h2>Estado de cuenta</h2>
        </div>
        {canAdd && (
          <button type="button" onClick={() => setFormOpen((value) => !value)}>
            + Nueva obligación
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="result">
          {message}
        </p>
      )}
      {formOpen && canAdd && (
        <ObligationForm
          pending={createMutation.isPending}
          onCancel={() => setFormOpen(false)}
          onSubmit={(input) => createMutation.mutate(input)}
        />
      )}
      {cancelId && canCancel && (
        <CancelForm
          pending={cancelMutation.isPending}
          onCancel={() => setCancelId(null)}
          onSubmit={(reason) => cancelMutation.mutate({ id: cancelId, reason })}
        />
      )}
      {paymentHistory && (
        <Modal
          title={`Pagos de ${paymentHistory.serviceDescription}`}
          onClose={() => setPaymentHistory(null)}
        >
          <PaymentHistory obligationId={paymentHistory.id} />
        </Modal>
      )}
      <div className="panel table-scroll">
        <table className="people-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => {
                const row = toObligationRow(item);
                const cancellable =
                  canCancel &&
                  row.status !== "PAID" &&
                  row.status !== "CANCELLED";
                return (
                  <tr key={row.id}>
                    <td>{row.serviceDescription}</td>
                    <td>{formatDate(row.dueDate)}</td>
                    <td>{row.statusLabel}</td>
                    <td>{row.balanceLabel}</td>
                    <td>
                      <button
                        type="button"
                        className="link"
                        onClick={() => setPaymentHistory(item)}
                      >
                        Ver pagos
                      </button>
                      {cancellable && (
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => setCancelId(row.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="empty">
                  No hay obligaciones para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ObligationForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: Record<string, string>) => void;
}) {
  const clients = useQuery({
    queryKey: ["clients"],
    queryFn: () => listClients(),
  });
  const activeClients =
    clients.data?.items.filter((item) => item.status === "ACTIVE") ?? [];
  return (
    <form
      className="panel obligation-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending || !activeClients.length) return;
        const data = Object.fromEntries(
          new FormData(event.currentTarget).entries(),
        );
        onSubmit(
          Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, String(value)]),
          ),
        );
      }}
    >
      <label>
        Cliente
        <select
          name="clientId"
          required
          disabled={pending || !activeClients.length}
          defaultValue=""
        >
          <option value="">Seleccioná un cliente</option>
          {activeClients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.displayName}
            </option>
          ))}
        </select>
      </label>
      {clients.isPending && <LoadingState label="Cargando clientes…" />}
      {clients.isError && <ErrorState message={clients.error.message} />}
      {clients.isSuccess && !activeClients.length && (
        <p>No hay clientes activos disponibles.</p>
      )}
      <label>
        Descripción
        <input
          name="serviceDescription"
          required
          defaultValue="Honorarios mensuales"
        />
      </label>
      <label>
        Período desde
        <input name="periodStartDate" type="date" required />
      </label>
      <label>
        Período hasta
        <input name="periodEndDate" type="date" required />
      </label>
      <label>
        Vencimiento
        <input name="dueDate" type="date" required />
      </label>
      <label>
        Importe ARS
        <input name="totalAmount" inputMode="decimal" required />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={pending || !activeClients.length}>
          {pending ? "Creando…" : "Crear obligación"}
        </button>
      </div>
    </form>
  );
}

function CancelForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  return (
    <form
      className="panel obligation-form"
      onSubmit={(event) => {
        event.preventDefault();
        const reason = String(
          new FormData(event.currentTarget).get("reason") ?? "",
        ).trim();
        if (reason) onSubmit(reason);
      }}
    >
      <label>
        Motivo de cancelación
        <input name="reason" required autoFocus />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Volver
        </button>
        <button type="submit" disabled={pending}>
          {pending ? "Cancelando…" : "Confirmar cancelación"}
        </button>
      </div>
    </form>
  );
}
