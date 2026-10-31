import { closeProfileModal } from "./profile-modal";

export function openPasswordModal(): void {
  closeProfileModal();
  const modal = document.createElement("div");
  modal.id = "password-modal";
  const issuer =
    (
      globalThis as typeof globalThis & {
        __APP_CONFIG__?: { VITE_OIDC_ISSUER?: string };
      }
    ).__APP_CONFIG__?.VITE_OIDC_ISSUER ??
    "http://localhost:8080/realms/saas-contable";
  const url = `${issuer}/account/#/security/signingin`;
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title"><button class="modal-close" type="button" aria-label="Cerrar">×</button><h2 id="password-title">Reestablece tu clave</h2><p>El cambio se realiza en Keycloak. La aplicación nunca recibe ni almacena tu clave.</p><iframe title="Cambio de clave en Keycloak" src="${url}"></iframe><p class="modal-message">Si el contenido no se muestra, <a href="${url}" target="_blank" rel="noreferrer">abrí el flujo oficial de Keycloak</a>.</p></section>`;
  document.body.append(modal);
  modal
    .querySelector(".modal-close")
    ?.addEventListener("click", () => modal.remove());
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.remove();
  });
}
