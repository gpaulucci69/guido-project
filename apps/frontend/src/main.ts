import "./styles.css";
import {
  accessToken,
  completeLogin,
  oidcUserManager,
  sessionIdentity,
} from "./auth/session";
import { renderLogin } from "./auth/auth-view";
import { createApiClient } from "./lib/api/client";
import { canAction } from "./auth/permission-evaluator";
import { renderAppHeader } from "./components/app-header";
import { openPasswordModal } from "./components/password-modal";
import { openProfileModal } from "./components/profile-modal";
import { canRoute } from "./auth/permission-evaluator";
import { loadClientContext, clientContextLabel } from "./auth/client-context";
import { renderNavigationLayout } from "./components/navigation-layout";
import { renderWelcome } from "./features/welcome/welcome-view";
import {
  ACCOUNT_STATUS_ROUTE,
  CLIENT_LIST_ROUTE,
  USER_LIST_ROUTE,
} from "./components/side-menu";
import { renderPeopleView } from "./features/people/people-view";
import { loadProfile } from "./auth/profile";
import { showSessionExpiredModal } from "./components/session-expired-modal";
import { renderClientsView } from "./features/clients/clients-view";
type Obligation = {
  id: string;
  serviceDescription: string;
  dueDate: string;
  status: string;
  balanceDue: string;
  totalAmount: string;
};
const api =
  (typeof import.meta.env?.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : undefined) ??
  `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("No se encontró el contenedor");
const root = app;
let sessionExpired = false;
function handleSessionExpired() {
  if (sessionExpired) return;
  sessionExpired = true;
  showSessionExpiredModal(() => {
    void oidcUserManager.removeUser().finally(() => {
      window.history.replaceState({}, document.title, "/");
      renderLogin(root);
    });
  });
}
window.addEventListener("oidc-session-expired", handleSessionExpired);
const money = (value: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    Number(value),
  );
const request = createApiClient({
  baseUrl: api,
  getToken: accessToken,
  onSessionExpired: handleSessionExpired,
});
let resolvedClientContext:
  Awaited<ReturnType<typeof loadClientContext>> | undefined;
async function getClientContext() {
  if (resolvedClientContext === undefined)
    resolvedClientContext = await loadClientContext();
  return resolvedClientContext;
}
async function render(identity: Awaited<ReturnType<typeof sessionIdentity>>) {
  if (!identity) return;
  const clientContext = await getClientContext();
  const clientName = clientContextLabel(clientContext);
  const clientDescription = clientContext?.description ?? "";
  const logoUrl = clientContext?.logoUrl ?? "";
  const navigate = (nextRoute: string) => {
    window.history.pushState({}, document.title, nextRoute);
    void render(identity);
  };
  const requestedRoute = window.location.pathname || "/home/welcome";
  const route =
    requestedRoute === ACCOUNT_STATUS_ROUTE
      ? ACCOUNT_STATUS_ROUTE
      : requestedRoute === CLIENT_LIST_ROUTE
        ? CLIENT_LIST_ROUTE
        : requestedRoute === USER_LIST_ROUTE
          ? USER_LIST_ROUTE
          : "/home/welcome";
  const protectedRoute =
    route === ACCOUNT_STATUS_ROUTE ||
    route === CLIENT_LIST_ROUTE ||
    route === USER_LIST_ROUTE;
  if (protectedRoute && !canRoute(identity.permissions, route)) {
    window.history.replaceState({}, document.title, "/home/welcome");
    renderNavigationLayout(
      identity,
      "/home/welcome",
      `<p class="result">No tenés permisos para consultar esta pantalla.</p>`,
      navigate,
      clientName,
      clientDescription,
      logoUrl,
    );
    await ensureHeader(identity);
    return;
  }
  if (route === "/home/welcome") {
    const profile = await loadProfile();
    renderNavigationLayout(
      identity,
      route,
      renderWelcome(
        profile?.firstName ?? identity.firstName,
        profile?.lastName ?? identity.lastName,
        profile?.alias ?? identity.alias
      ),
      navigate,
      clientName,
      clientDescription,
      logoUrl,
    );
    await ensureHeader(identity);
    return;
  }
  if (route === CLIENT_LIST_ROUTE || route === USER_LIST_ROUTE) {
    renderNavigationLayout(
      identity,
      route,
      "",
      navigate,
      clientName,
      clientDescription,
      logoUrl,
    );
    const page = document.querySelector<HTMLElement>("#page-content");
    if (!page) return;
    if (route === CLIENT_LIST_ROUTE)
      await renderClientsView(page, identity.permissions, () => void render(identity));
    else
      await renderPeopleView(page, {
        type: "user",
        permissions: identity.permissions,
        onChanged: () => render(identity),
      });
    await ensureHeader(identity);
    return;
  }
  let obligations: Obligation[] = [];
  try {
    obligations = (await request<{ items: Obligation[] }>("/obligations"))
      .items;
  } catch {
    /* API is shown as unavailable below. */
  }
  renderNavigationLayout(
    identity,
    route,
    `<section class="toolbar"><h2>Estado de cuenta</h2>${canAction(identity.permissions, "add/customer") ? '<button id="new">+ Nueva obligación</button>' : ""}</section><section class="panel"><table><thead><tr><th>Servicio</th><th>Vencimiento</th><th>Estado</th><th>Saldo</th><th></th></tr></thead><tbody id="rows">${obligations.length ? obligations.map((item) => row(item, identity.permissions)).join("") : '<tr><td colspan="5" class="empty">No hay obligaciones. Creá la primera para comenzar.</td></tr>'}</tbody></table></section><section id="form" class="panel hidden"><h2>Nueva obligación</h2><form id="create"><label>Descripción<input name="serviceDescription" required value="Honorarios mensuales" /></label><label>Período desde<input name="periodStartDate" type="date" required /></label><label>Período hasta<input name="periodEndDate" type="date" required /></label><label>Vencimiento<input name="dueDate" type="date" required /></label><label>Importe ARS<input name="totalAmount" inputmode="decimal" required placeholder="80000.00" /></label><div><button type="submit">Crear obligación</button><button type="button" class="secondary" id="close">Cancelar</button></div><p id="message" class="result"></p></form></section>`,
    navigate,
    clientName,
    clientDescription,
    logoUrl,
  );
  await ensureHeader(identity);
  document
    .querySelector("#new")
    ?.addEventListener("click", () =>
      document.querySelector("#form")?.classList.remove("hidden"),
    );
  document
    .querySelector("#close")
    ?.addEventListener("click", () =>
      document.querySelector("#form")?.classList.add("hidden"),
    );
  document
    .querySelector<HTMLFormElement>("#create")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget as HTMLFormElement);
      const input = Object.fromEntries(form.entries());
      const message = document.querySelector("#message");
      try {
        await request("/obligations", {
          method: "POST",
          body: JSON.stringify({ ...input, clientId: "demo-client" }),
        });
        if (message) message.textContent = "Obligación creada correctamente.";
        await render(identity);
      } catch (error) {
        if (message)
          message.textContent =
            error instanceof Error
              ? error.message
              : "No se pudo crear la obligación.";
      }
    });
  document
    .querySelectorAll<HTMLButtonElement>("[data-cancel]")
    .forEach((button) =>
      button.addEventListener("click", async () => {
        const reason = window.prompt("Motivo de cancelación:");
        if (!reason) return;
        await request(`/obligations/${button.dataset.cancel}/cancel`, {
          method: "POST",
          body: JSON.stringify({ reason }),
        });
        await render(identity);
      }),
    );
}

async function ensureHeader(
  identity: Awaited<ReturnType<typeof sessionIdentity>>,
  force = false,
) {
  if (!identity) return;
  const header = document.querySelector<HTMLElement>("#account-header");
  if (!force && header?.dataset.ready === "true") return;
  await renderAppHeader({
    identityAlias: identity.alias,
    clientRoles: identity.roles,
    onEditProfile: (profile) =>
      openProfileModal(profile, async () => {
        await render(identity);
        await refreshHeader(identity);
      }),
    onResetPassword: openPasswordModal,
  });
  if (header) header.dataset.ready = "true";
}

async function refreshHeader(
  identity: Awaited<ReturnType<typeof sessionIdentity>>,
): Promise<void> {
  document
    .querySelector<HTMLElement>("#account-header")
    ?.removeAttribute("data-ready");
  await ensureHeader(identity);
}
function row(
  item: Obligation,
  permissions: readonly { type: "route" | "action"; value: string }[],
) {
  return `<tr><td><strong>${item.serviceDescription}</strong><small>${item.id.slice(0, 8)}</small></td><td>${item.dueDate}</td><td><span class="badge">${item.status}</span></td><td>${money(item.balanceDue)}</td><td>${item.status !== "CANCELLED" && item.status !== "PAID" && canAction(permissions, "cancel/obligation") ? `<button class="link" data-cancel="${item.id}">Cancelar</button>` : ""}</td></tr>`;
}
void (async () => {
  try {
    if (window.location.pathname === "/auth/callback") {
      await completeLogin();
      window.history.replaceState({}, document.title, "/");
    }
    const identity = await sessionIdentity();
    if (!identity) {
      renderLogin(root);
      return;
    }
    await render(identity);
  } catch (error) {
    console.error("Error al validar la sesión OIDC", error);
    renderLogin(
      root,
      error instanceof Error && error.message
        ? `No se pudo validar tu sesión: ${error.message}`
        : "No se pudo validar tu sesión. Intentá nuevamente.",
    );
  }
})();
