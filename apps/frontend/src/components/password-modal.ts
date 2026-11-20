import { accessToken } from "../auth/session";
import { createApiClient } from "../lib/api/client";

const api = createApiClient({ baseUrl: `${window.location.protocol}//${window.location.hostname}:3001/api/v1`, getToken: accessToken });

export function openPasswordModal(): void {
  document.querySelector("#password-modal")?.remove();
  const modal = document.createElement("div");
  modal.id = "password-modal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="password-title"><button class="modal-close" type="button" aria-label="Cerrar">×</button><h2 id="password-title">Restablecer tu clave</h2><p>Elegí una nueva clave para tu cuenta.</p><form><label>Nueva clave<input name="password" type="password" minlength="8" autocomplete="new-password" required /></label><label>Repetir nueva clave<input name="confirmation" type="password" minlength="8" autocomplete="new-password" required /></label><p class="modal-message" role="status" aria-live="polite"></p><div class="modal-actions"><button type="submit">Actualizar clave</button><button type="button" class="secondary" data-cancel>Cancelar</button></div></form></section>`;
  document.body.append(modal);
  const close = () => modal.remove();
  modal.querySelector(".modal-close")?.addEventListener("click", close);
  modal.querySelector("[data-cancel]")?.addEventListener("click", close);
  modal.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  modal.querySelector("form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    const message = modal.querySelector<HTMLElement>(".modal-message");
    if (password !== confirmation) { if (message) message.textContent = "Las claves no coinciden."; return; }
    try {
      await api<void>("/profile/password", { method: "PATCH", body: JSON.stringify({ password, confirmation }) });
      if (message) message.textContent = "Clave actualizada correctamente.";
      window.setTimeout(close, 700);
    } catch (error) { if (message) message.textContent = error instanceof Error ? error.message : "No se pudo actualizar la clave."; }
  });
  modal.querySelector<HTMLInputElement>("input")?.focus();
}
