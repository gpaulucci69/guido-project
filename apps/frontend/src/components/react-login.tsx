import { login } from "../auth/oidc-client.js";

export function ReactLogin({
  message = "Iniciá sesión para continuar.",
}: {
  message?: string;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">SAAS CONTABLE</span>
        <h1>Acceso seguro</h1>
        <p>{message}</p>
        <button type="button" onClick={() => void login()}>
          Iniciar sesión
        </button>
      </section>
    </main>
  );
}
