import type { FrontendIdentity } from "../auth/session";
import { bindSideMenu, renderSideMenu } from "./side-menu";

export function renderNavigationLayout(
  identity: FrontendIdentity,
  route: string,
  content: string,
  onNavigate?: (route: string) => void,
  clientName?: string,
  clientDescription?: string,
  logoUrl?: string,
): void {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) return;
  const currentContent = root.querySelector<HTMLElement>("#page-content");
  if (currentContent) {
    currentContent.innerHTML = content;
    root
      .querySelectorAll<HTMLAnchorElement>("[data-route]")
      .forEach((link) =>
        link.classList.toggle("active", link.dataset.route === route),
      );
    return;
  }
  root.innerHTML = `<main class="app-layout">${renderSideMenu(identity.permissions, route, clientName, clientDescription, logoUrl)}<div class="content-area"><header id="account-header" class="header"></header><section id="page-content">${content}</section></div></main>`;
  bindSideMenu(root, onNavigate);
}
