import "./styles.css";
import { accessToken, completeLogin, sessionIdentity } from "./auth/session";
import { demoLabel, renderLogin } from "./auth/auth-view";
import { createApiClient } from "./lib/api/client";
import { canAction } from "./auth/permission-evaluator";
type Obligation = {
  id: string;
  serviceDescription: string;
  dueDate: string;
  status: string;
  balanceDue: string;
  totalAmount: string;
};
const api = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("No se encontró el contenedor");
const root = app;
const money = (value: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    Number(value),
  );
const request = createApiClient({ baseUrl: api, getToken: accessToken });
async function render(identity: Awaited<ReturnType<typeof sessionIdentity>>) {
  if (!identity) return;
  let obligations: Obligation[] = [];
  try {
    obligations = (await request<{ items: Obligation[] }>("/obligations"))
      .items;
  } catch {
    /* API is shown as unavailable below. */
  }
  root.innerHTML = `<main class="shell"><header class="header"><div><span class="eyebrow">SAAS CONTABLE</span><h1>Panel de cobranzas</h1><p class="muted">Gestioná obligaciones y rendiciones de pago.</p></div><span class="status"><i></i> ${demoLabel(identity.isDemo)}</span></header><section class="toolbar"><h2>Obligaciones</h2>${canAction(identity.permissions, "add/customer") ? '<button id="new">+ Nueva obligación</button>' : ""}</section><section class="panel"><table><thead><tr><th>Servicio</th><th>Vencimiento</th><th>Estado</th><th>Saldo</th><th></th></tr></thead><tbody id="rows">${obligations.length ? obligations.map((item) => row(item, identity.permissions)).join("") : '<tr><td colspan="5" class="empty">No hay obligaciones. Creá la primera para comenzar.</td></tr>'}</tbody></table></section><section id="form" class="panel hidden"><h2>Nueva obligación</h2><form id="create"><label>Descripción<input name="serviceDescription" required value="Honorarios mensuales" /></label><label>Período desde<input name="periodStartDate" type="date" required /></label><label>Período hasta<input name="periodEndDate" type="date" required /></label><label>Vencimiento<input name="dueDate" type="date" required /></label><label>Importe ARS<input name="totalAmount" inputmode="decimal" required placeholder="80000.00" /></label><div><button type="submit">Crear obligación</button><button type="button" class="secondary" id="close">Cancelar</button></div><p id="message" class="result"></p></form></section></main>`;
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
