import {
  fallbackAlias,
  initials,
  loadProfile,
  type UserProfile,
} from "../auth/profile";
import { logout } from "../auth/oidc-client";

export type HeaderOptions = {
  onEditProfile: (profile: UserProfile) => void;
  onResetPassword: () => void;
  /** Alias proveniente del token, usado si el adaptador de perfil aún no lo devuelve. */
  identityAlias?: string;
};

export async function renderAppHeader(
  options: HeaderOptions,
): Promise<UserProfile | null> {
  const profile = await loadProfile();
  if (!profile) return null;
  const header = document.querySelector<HTMLElement>("#account-header");
  if (!header) return profile;
  const label = fallbackAlias({
    ...profile,
    alias: profile.alias.trim() || options.identityAlias?.trim() || "",
  });
  const avatar = profile.avatarUrl
    ? `<img class="user-avatar" data-avatar-image src="${escapeAttribute(profile.avatarUrl)}" alt="" />`
    : `<span class="user-avatar user-initials" aria-hidden="true">${escapeHtml(initials(profile))}</span>`;
  header.innerHTML = `<div class="account-tools"><button class="notification-button" type="button" aria-label="Notificaciones" title="Notificaciones">🔔</button><span class="account-alias">${escapeHtml(label)}</span><button id="avatar-button" class="avatar-button" type="button" aria-expanded="false" aria-controls="account-menu" aria-label="Abrir menú de ${escapeHtml(label)}">${avatar}</button><div id="account-menu" class="account-menu hidden" role="menu"><button type="button" data-account-action="edit" role="menuitem">Editar perfil</button><button type="button" data-account-action="password" role="menuitem">Reestablece tu clave</button><button type="button" data-account-action="logout" role="menuitem">Logout</button></div></div>`;
  header
    .querySelector<HTMLImageElement>("[data-avatar-image]")
    ?.addEventListener("error", (event) => {
      const image = event.currentTarget as HTMLImageElement;
      const fallback = document.createElement("span");
      fallback.className = "user-avatar user-initials";
      fallback.setAttribute("aria-label", `Iniciales de ${label}`);
      fallback.textContent = initials(profile);
      image.replaceWith(fallback);
    });
  const toggle = header.querySelector<HTMLButtonElement>("#avatar-button");
  const menu = header.querySelector<HTMLElement>("#account-menu");
  const close = () => {
    menu?.classList.add("hidden");
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const open = menu?.classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener(
    "click",
    (event) => {
      if (!header.contains(event.target as Node)) close();
    },
    { once: true },
  );
  header
    .querySelector('[data-account-action="edit"]')
    ?.addEventListener("click", () => {
      close();
      options.onEditProfile(profile);
    });
  header
    .querySelector('[data-account-action="password"]')
    ?.addEventListener("click", () => {
      close();
      options.onResetPassword();
    });
  header
    .querySelector('[data-account-action="logout"]')
    ?.addEventListener("click", () => {
      close();
      void logout();
    });
  return profile;
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
function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
