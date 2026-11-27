import { useQuery } from "@tanstack/react-query";
import { accessToken } from "../../auth/session.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/ui-states.js";
import { createApiClient } from "../../lib/api/client.js";
import { formatDate } from "../../lib/formatters/date.js";
import { paymentAmountLabel, paymentStatusLabel } from "./payment-view.js";

type PaymentRow = {
  id: string;
  amount: string;
  status: string;
  paymentDate: string;
};

export function PaymentHistory({ obligationId }: { obligationId: string }) {
  const query = useQuery({
    queryKey: ["obligations", "payments", obligationId],
    queryFn: ({ signal }) =>
      createApiClient({
        baseUrl: `${window.location.protocol}//${window.location.hostname}:3000/api/v1`,
        getToken: accessToken,
      })<PaymentRow[]>(`/payments/${encodeURIComponent(obligationId)}`, {
        signal,
      }),
  });
  if (query.isPending) return <LoadingState label="Cargando pagos…" />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (!query.data?.length)
    return (
      <EmptyState message="No hay pagos registrados para esta obligación." />
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Importe</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {query.data.map((payment) => (
            <tr key={payment.id}>
              <td>{formatDate(payment.paymentDate)}</td>
              <td>{paymentAmountLabel(payment.amount)}</td>
              <td>{paymentStatusLabel(payment.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
