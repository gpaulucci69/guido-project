import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { identityFromUser } from "../auth/session.js";
import { ReactNavigation } from "../components/react-navigation.js";
import {
  associatesPath,
  canOpenRoute,
  ProtectedRoute,
  usersPath,
} from "./routes.js";

const { session } = vi.hoisted(() => ({
  session: vi.fn(),
}));
vi.mock("./session-context.js", () => ({ useSession: session }));

describe("protected React routes", () => {
  it("allows an explicitly authorized route", () =>
    expect(
      canOpenRoute(
        [{ type: "route", value: "/home/client/list" }],
        "/home/client/list",
      ),
    ).toBe(true));
  it("denies routes not present in the identity permissions", () =>
    expect(canOpenRoute([], "/home/users/list")).toBe(false));
  it("requires distinct route permissions for Asociados and Usuarios", () => {
    const associates = [
      { type: "route", value: "/home/contributors/list" },
    ] as const;
    const users = [{ type: "route", value: "/home/users/list" }] as const;
    expect(canOpenRoute(associates, associatesPath)).toBe(true);
    expect(canOpenRoute(associates, usersPath)).toBe(false);
    expect(canOpenRoute(users, associatesPath)).toBe(false);
    expect(canOpenRoute(users, usersPath)).toBe(true);
    expect(
      canOpenRoute(
        [{ type: "action", value: "/home/contributors/list" }],
        associatesPath,
      ),
    ).toBe(false);
  });
  it.each([
    ["/home/contributors/list", "Asociados", "Usuarios"],
    ["/home/users/list", "Usuarios", "Asociados"],
  ])(
    "shows only the corresponding menu item for %s",
    (route, shown, hidden) => {
      const identity = identityFromUser({
        profile: {
          sub: "user-1",
          authorization: { client_id: "guido", routes: [route] },
        },
      } as never);
      const menu = renderToStaticMarkup(
        <ReactNavigation
          currentPath="/home/welcome"
          identity={identity}
          context={null}
          onNavigate={() => undefined}
        />,
      );
      expect(menu).toContain(`aria-label="${shown}"`);
      expect(menu).not.toContain(`aria-label="${hidden}"`);
    },
  );
  it("normalizes route values without a leading slash", () =>
    expect(
      canOpenRoute(
        [{ type: "route", value: "home/client/services" }],
        "/home/client/services",
      ),
    ).toBe(true));
  it("does not render the protected view for an unauthorized session", () => {
    session.mockReturnValue({
      status: "authenticated",
      identity: { permissions: [{ type: "route", value: "/home/users/list" }] },
    });
    const view = renderToStaticMarkup(
      <ProtectedRoute route={associatesPath}>
        <p>Listado de asociados</p>
      </ProtectedRoute>,
    );
    expect(view).toContain("No tenés permisos");
    expect(view).not.toContain("Listado de asociados");
  });
  it("uses the same route and action requirements for the report link and view", () => {
    const route = "/home/reports/cash-flow";
    const permissions = [
      { type: "route", value: route },
      { type: "action", value: "report/view" },
    ] as const;
    expect(canOpenRoute(permissions.slice(0, 1), route)).toBe(false);
    expect(canOpenRoute(permissions.slice(1), route)).toBe(false);
    expect(canOpenRoute(permissions, route)).toBe(true);
  });
});
