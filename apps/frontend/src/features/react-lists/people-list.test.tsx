import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AdministrableIdentity } from "../../../../../packages/contracts/people.js";
import { PeopleList } from "./people-list.js";

vi.mock("../people/people-api.js", () => ({ listPeople: vi.fn() }));

const people = [
  { firstName: "Ana", clientRole: "COLABORADOR" },
  { firstName: "Bruno", clientRoles: ["OPERADOR", "ASOCIADO"] },
  {
    firstName: "Celia",
    clientRoles: ["SUPER_ADMIN", "OPERADOR"],
    lastLoginAt: "2026-11-27T12:45:00.000Z",
  },
  { firstName: "Diego", clientRoles: [] },
  { firstName: "Elena", clientRoles: ["GESTOR"] },
].map((person, index): AdministrableIdentity => ({
  id: String(index),
  type: "user",
  lastName: "García",
  alias: "",
  email: `persona${index}@example.com`,
  enabled: true,
  username: `persona${index}`,
  ...person,
}));

function renderList(group: "associates" | "users") {
  const client = new QueryClient();
  client.setQueryData(["people", "user", group], people);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <PeopleList
        group={group}
        permissions={[
          { type: "action", value: "user/add" },
          { type: "action", value: "user/edit" },
          { type: "action", value: "user/update" },
        ]}
      />
    </QueryClientProvider>,
  );
}

describe("Listados de asociados y usuarios", () => {
  it("separates users by role and keeps both sets of management actions", () => {
    const associates = renderList("associates");
    expect(associates).toContain("<h2>Asociados</h2>");
    expect(associates).toContain("Ana");
    expect(associates).toContain("Bruno");
    expect(associates).not.toMatch(/Celia|Diego/);
    expect(associates).toContain("Nuevo asociado");
    expect(associates).not.toContain("Último acceso");

    const users = renderList("users");
    expect(users).toContain("<h2>Usuarios</h2>");
    expect(users).toContain("Celia");
    expect(users).not.toMatch(/Ana|Bruno|Diego/);
    expect(users).toContain("Nuevo usuario");
    expect(users).toContain("Email");
    expect(users).toContain("persona2@example.com");
    expect(users).toContain("Último acceso");
    expect(users).toMatch(/27\/11\/2026.*09:45/);
    expect(users).toMatch(/Elena.*<td>—<\/td>/);

    for (const list of [associates, users]) {
      expect(list).toContain('aria-label="Editar"');
      expect(list).toContain('aria-label="Desactivar"');
    }
  });
});
