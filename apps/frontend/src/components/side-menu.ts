import type { FrontendPermission } from "../auth/session";
import { canRoute } from "../auth/permission-evaluator";

export const ACCOUNT_STATUS_ROUTE = "/home/client/services";
export const CLIENT_LIST_ROUTE = "/home/client/list";
export const USER_LIST_ROUTE = "/home/users/list";

const icons = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" /></svg>',
  account:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm4 3h8M8 12h8M8 16h5" /></svg>',
};

export function hasAccountStatusRoute(
  permissions: readonly FrontendPermission[],
): boolean {
  return canRoute(permissions, ACCOUNT_STATUS_ROUTE);
}

export function renderSideMenu(
  permissions: readonly FrontendPermission[],
  currentRoute: string,
  clientName = "Contexto actual",
  clientDescription = "",
  logoUrl = "",
): string {
  const accountStatus = hasAccountStatusRoute(permissions);
  const logo = logoUrl
    ? `<img class="brand-logo" src="${escapeAttribute(logoUrl)}" alt="" />`
    : `<span class="brand-mark">G</span>`;
  const clientList = hasRoute(permissions, CLIENT_LIST_ROUTE);
  const userList = hasRoute(permissions, USER_LIST_ROUTE);
  return `<aside id="side-menu" class="side-menu" aria-label="Navegación principal"><div class="menu-brand">${logo}<span class="menu-label"><strong>${escapeHtml(clientName)}</strong></span></div><button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="true" aria-controls="menu-links" aria-label="Colapsar menú">${icons.menu}<span class="menu-label">Menú</span></button><nav id="menu-links" class="menu-links"><a class="menu-link ${currentRoute === "/home/welcome" ? "active" : ""}" href="/home/welcome" data-route="/home/welcome" aria-label="Inicio">${icons.home}<span class="menu-label">Inicio</span></a>${accountStatus ? `<a class="menu-link ${currentRoute === ACCOUNT_STATUS_ROUTE ? "active" : ""}" href="${ACCOUNT_STATUS_ROUTE}" data-route="${ACCOUNT_STATUS_ROUTE}" aria-label="Estado de cuenta">${icons.account}<span class="menu-label">Estado de cuenta</span></a>` : ""}${clientList ? `<a class="menu-link ${currentRoute === CLIENT_LIST_ROUTE ? "active" : ""}" href="${CLIENT_LIST_ROUTE}" data-route="${CLIENT_LIST_ROUTE}" aria-label="Clientes del estudio">${icons.account}<span class="menu-label">Clientes del estudio</span></a>` : ""}${userList ? `<a class="menu-link ${currentRoute === USER_LIST_ROUTE ? "active" : ""}" href="${USER_LIST_ROUTE}" data-route="${USER_LIST_ROUTE}" aria-label="Contadores del estudio">${icons.account}<span class="menu-label">Contadores del estudio</span></a>` : ""}</nav>${clientDescription ? `<div class="menu-footer menu-label">${escapeHtml(clientDescription)}</div>` : ""}</aside>`;
}

function hasRoute(
  permissions: readonly FrontendPermission[],
  route: string,
): boolean {
  return canRoute(permissions, route);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );
}

export function bindSideMenu(
  root: HTMLElement,
  onNavigate?: (route: string) => void,
): void {
  const menu = root.querySelector<HTMLElement>("#side-menu");
  const toggle = root.querySelector<HTMLButtonElement>("#menu-toggle");
  if (
    menu &&
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 700px)").matches
  ) {
    menu.classList.add("collapsed");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Expandir menú");
  }
  toggle?.addEventListener("click", () => {
    const collapsed = menu?.classList.toggle("collapsed") ?? false;
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expandir menú" : "Colapsar menú",
    );
  });
  root.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!onNavigate) return;
      event.preventDefault();
      onNavigate(link.dataset.route ?? "/home/welcome");
    });
  });
}
