import type { FrontendIdentity } from "../auth/session.js";
import type { ClientContext } from "../../../../packages/contracts/navigation.js";
import { fallbackAlias } from "../auth/profile-normalization.js";

export function ReactWelcome({
  identity,
  context,
}: {
  identity: FrontendIdentity;
  context: ClientContext | null;
}) {
  const label = fallbackAlias({
    firstName: identity.firstName,
    lastName: identity.lastName,
    alias: identity.alias,
  });
  return (
    <section className="welcome-view">
      <span className="eyebrow">INICIO</span>
      <h1>Bienvenido {label}</h1>
      <p>
        {context?.description || "Este es tu espacio de trabajo en contable."}
      </p>
      {identity.roles.length > 0 && (
        <div className="panel">
          <strong>Roles del cliente</strong>
          <p>{identity.roles.join(" · ")}</p>
        </div>
      )}
    </section>
  );
}
