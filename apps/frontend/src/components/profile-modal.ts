import { updateProfile, type UserProfile } from "../auth/profile";

export function openProfileModal(
  profile: UserProfile,
  onSaved: () => Promise<void> | void,
): void {
  closeProfileModal();
  const modal = document.createElement("div");
  modal.id = "profile-modal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button class="modal-close" type="button" aria-label="Cerrar">×</button><h2 id="profile-title">Editar perfil</h2><form id="profile-form"><label>Nombre<input name="firstName" value="${escapeHtml(profile.firstName)}" required /></label><label>Apellido<input name="lastName" value="${escapeHtml(profile.lastName)}" required /></label><label>Alias<input name="alias" value="${escapeHtml(profile.alias)}" /></label><label>Avatar<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label><p class="modal-message" role="status"></p><div class="modal-actions"><button type="submit">Guardar</button><button type="button" class="secondary" data-cancel>Cancelar</button></div></form></section>`;
  document.body.append(modal);
  const form = modal.querySelector<HTMLFormElement>("form");
  const message = modal.querySelector<HTMLElement>(".modal-message");
  modal
    .querySelector(".modal-close")
    ?.addEventListener("click", closeProfileModal);
  modal
    .querySelector("[data-cancel]")
    ?.addEventListener("click", closeProfileModal);
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfileModal();
  });
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const file = data.get("avatar");
    try {
      if (file instanceof File && file.size > 5 * 1024 * 1024)
        throw new Error("La imagen no puede superar los 5 MB.");
      await updateProfile({
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        alias: String(data.get("alias") ?? ""),
        ...(file instanceof File && file.size ? { avatar: file } : {}),
      });
      if (message) message.textContent = "Perfil actualizado correctamente.";
      await onSaved();
      window.setTimeout(closeProfileModal, 400);
    } catch (error) {
      if (message)
        message.textContent =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil.";
    }
  });
  form?.querySelector<HTMLInputElement>("input")?.focus();
}

export function closeProfileModal(): void {
  document.querySelector("#profile-modal")?.remove();
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
