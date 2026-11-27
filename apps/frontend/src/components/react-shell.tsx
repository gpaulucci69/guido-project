import { useEffect, useState } from "react";
import { clientsPath } from "../../../../packages/contracts/clients.js";
import { useSession } from "../app/session-context.js";
import { useClientContext } from "../app/client-context.js";
import { ReactLogin } from "./react-login.js";
import { ReactNavigation } from "./react-navigation.js";
import { ReactHeader } from "./react-header.js";
import { ReactWelcome } from "./react-welcome.js";
import { ClientList } from "../features/react-lists/client-list.js";
import { PeopleList } from "../features/react-lists/people-list.js";
import { ObligationList } from "../features/react-lists/obligation-list.js";
import { CashFlowReport } from "../features/react-lists/cash-flow-report.js";
import {
  appRoutes,
  associatesPath,
  ProtectedRoute,
  usersPath,
} from "../app/routes.js";
import { Modal } from "./ui-states.js";
import { oidcUserManager } from "../auth/oidc-client.js";
import { useQueryClient } from "@tanstack/react-query";

export function ReactShell() {
  const session = useSession();
  const context = useClientContext();
  const queryClient = useQueryClient();
  const [expired, setExpired] = useState(false);
  const [expirationAcknowledged, setExpirationAcknowledged] = useState(false);
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const handler = () => {
      setExpired(true);
      queryClient.clear();
    };
    window.addEventListener("oidc-session-expired", handler);
    const unsubscribe = oidcUserManager.events.addAccessTokenExpired(handler);
    return () => {
      window.removeEventListener("oidc-session-expired", handler);
      unsubscribe();
    };
  }, [queryClient]);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  if (expired && !expirationAcknowledged) {
    const acknowledge = () => {
      void oidcUserManager.removeUser();
      setExpirationAcknowledged(true);
    };
    return (
      <Modal title="Sesión expirada" onClose={acknowledge}>
        <p>Tu sesión expiró. Iniciá sesión nuevamente para continuar.</p>
        <button type="button" onClick={acknowledge}>
          Aceptar
        </button>
      </Modal>
    );
  }
  if (!expired && session.status === "loading")
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p role="status">Cargando sesión…</p>
        </section>
      </main>
    );
  if (expired || session.status !== "authenticated" || !session.identity)
    return (
      <ReactLogin
        {...(expired
          ? {
              message:
                "Tu sesión expiró. Iniciá sesión nuevamente para continuar.",
            }
          : session.error
            ? { message: session.error }
            : {})}
      />
    );
  const navigate = (nextPath: string) => {
    if (nextPath === window.location.pathname) return;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };
  const currentPath = appRoutes.some((route) => route.path === path)
    ? path
    : "/home/welcome";
  const content =
    path === clientsPath ? (
      <ClientList permissions={session.identity.permissions} />
    ) : path === associatesPath || path === usersPath ? (
      <PeopleList
        key={path}
        group={path === associatesPath ? "associates" : "users"}
        permissions={session.identity.permissions}
      />
    ) : path === "/home/client/services" ? (
      <ObligationList permissions={session.identity.permissions} />
    ) : path === "/home/reports/cash-flow" ? (
      <CashFlowReport permissions={session.identity.permissions} />
    ) : (
      <ReactWelcome identity={session.identity} context={context} />
    );
  return (
    <main className="app-layout">
      <ReactNavigation
        currentPath={currentPath}
        identity={session.identity}
        context={context}
        onNavigate={navigate}
      />
      <div className="content-area">
        <ReactHeader identity={session.identity} />
        <div id="page-content">
          <ProtectedRoute route={currentPath}>{content}</ProtectedRoute>
        </div>
      </div>
    </main>
  );
}
