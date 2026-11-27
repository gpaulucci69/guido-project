import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FrontendPermission } from "../../auth/session.js";
import { ClientList } from "./client-list.js";

vi.mock("../clients/clients-api.js", () => ({
  listClients: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  updateClientStatus: vi.fn(),
}));

function renderList(
  permissions: readonly FrontendPermission[],
  items?: object[],
) {
  const client = new QueryClient();
  if (items) client.setQueryData(["clients"], { items });
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ClientList permissions={permissions} />
    </QueryClientProvider>,
  );
}

describe("Clientes del estudio", () => {
  it("renders a dataset of 1,000 clients through the table model", () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({
      id: String(index),
      displayName: `Cliente de prueba ${index + 1}`,
      type: "INDIVIDUAL",
      cuit: String(index),
      status: "ACTIVE",
    }));
    const result = renderList([], rows);
    expect(result).toContain("Cliente de prueba 1000");
    expect(result.match(/<tr>/g)).toHaveLength(1001);
  });

  it("distinguishes loading from an empty result", () => {
    expect(renderList([])).toContain("Cargando clientes");
    expect(renderList([], [])).toContain("No hay clientes");
  });

  it("hides mutation controls and renders operations independently", () => {
    const items = [
      {
        id: "1",
        displayName: "Estudio Sur",
        type: "LEGAL_ENTITY",
        cuit: "30123456789",
        status: "ACTIVE",
      },
    ];
    const readOnly = renderList([], items);
    expect(readOnly).toContain("Estudio Sur");
    expect(readOnly).not.toMatch(/Nuevo cliente|Editar|Desactivar|Acciones/);
    const withStatus = renderList(
      [{ type: "action", value: "client/status" }],
      items,
    );
    expect(withStatus).toContain("Desactivar");
    expect(withStatus).not.toMatch(/Nuevo cliente|Editar/);
  });
});
