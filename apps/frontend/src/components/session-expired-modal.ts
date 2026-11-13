const MESSAGE =
  "Su sesión ha expirado, por favor, vuelva a autenticarse para validar su identidad";

export function showSessionExpiredModal(onAccept: () => void): void {
  if (document.querySelector("[data-session-expired-modal]")) return;
  const modal = document.createElement("div");
  modal.dataset.sessionExpiredModal = "true";
  modal.className = "session-expired-backdrop";
  modal.innerHTML = `<section class="session-expired-modal" role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title" aria-describedby="session-expired-message"><h2 id="session-expired-title">Sesión expirada</h2><p id="session-expired-message">${MESSAGE}</p><button type="button" data-session-expired-accept>Aceptar</button></section>`;
  document.body.append(modal);
  const button = modal.querySelector<HTMLButtonElement>(
    "[data-session-expired-accept]",
  );
  button?.focus();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      button?.focus();
    }
  };
  modal.addEventListener("keydown", onKeyDown);
  button?.addEventListener("click", () => {
    modal.remove();
    onAccept();
  });
}

export { MESSAGE as SESSION_EXPIRED_MESSAGE };
