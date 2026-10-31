import { login } from "./session";

export function renderLogin(
  container: HTMLElement,
  message = "Iniciá sesión para continuar.",
): void {
  container.innerHTML = `<main class="auth-shell"><section class="auth-card"><span class="eyebrow">SAAS CONTABLE</span><h1>Acceso seguro</h1><p>${message}</p><button id="login">Iniciar sesión</button></section></main>`;
  container
    .querySelector<HTMLButtonElement>("#login")
    ?.addEventListener("click", async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      button.textContent = "Conectando…";
      try {
        await login();
      } catch {
        button.disabled = false;
        button.textContent = "Iniciar sesión";
        const messageElement = container.querySelector("p");
        if (messageElement)
          messageElement.textContent =
            "No se pudo iniciar sesión. Verificá Keycloak e intentá nuevamente.";
      }
    });
}

export function renderSessionExpired(container: HTMLElement): void {
  renderLogin(
    container,
    "Tu sesión expiró. Iniciá sesión nuevamente para continuar.",
  );
}

export function demoLabel(isDemo: boolean): string {
  return isDemo ? "Sesión demo" : "Sesión autenticada";
}
