import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createApiClient } from "../../lib/api/client.js";
import { accessToken, type FrontendPermission } from "../../auth/session.js";
import {
  formatCashFlow,
  type CashFlowMetrics,
} from "../reports/cash-flow-view.js";
import { ErrorState, LoadingState } from "../../components/ui-states.js";

const api = createApiClient({
  baseUrl: `${window.location.protocol}//${window.location.hostname}:3000/api/v1`,
  getToken: accessToken,
});
export function CashFlowReport({
  permissions,
}: {
  permissions: readonly FrontendPermission[];
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const allowed = permissions.some(
    (item) => item.type === "action" && item.value === "report/view",
  );
  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);
  const params = new URLSearchParams();
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const query = useQuery({
    queryKey: ["cash-flow", fromDate, toDate],
    queryFn: () => api<CashFlowMetrics>(`/reports/cash-flow?${params}`),
    enabled: allowed && !invalidRange,
  });
  if (!allowed)
    return <p role="alert">No tenés permisos para consultar reportes.</p>;
  const metrics = query.data && formatCashFlow(query.data);
  const labels = {
    invoiced: "Facturado",
    collected: "Cobrado",
    pending: "Pendiente",
    overdue: "Vencido",
  };
  return (
    <section className="people-view">
      <div className="toolbar">
        <div>
          <span className="eyebrow">REPORTES</span>
          <h2>Flujo de fondos</h2>
        </div>
      </div>
      <form
        className="list-filters"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Desde
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
      </form>
      {invalidRange && (
        <ErrorState message="La fecha desde debe ser anterior o igual a la fecha hasta." />
      )}
      {query.isLoading && <LoadingState label="Cargando flujo de fondos…" />}
      {query.isError && (
        <ErrorState message="No se pudo cargar el flujo de fondos." />
      )}
      {!invalidRange && metrics && (
        <div className="panel">
          <div className="metrics-grid">
            {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
              <article key={key}>
                <span className="eyebrow">{labels[key]}</span>
                <strong>{metrics[key]}</strong>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
