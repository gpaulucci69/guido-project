import type {
  AdministrableIdentity,
  PeopleCreate,
  PeopleType,
} from "../../../../../packages/contracts/people.js";
import { canAction } from "../../auth/permission-evaluator";
import { createPerson, updatePerson } from "./people-api";

export type PeopleFormOptions = {
  type: PeopleType;
  permissions: readonly { type: "route" | "action"; value: string }[];
  person?: AdministrableIdentity;
  onSaved: () => Promise<void> | void;
  onClose: () => void;
};

export function openPeopleForm(options: PeopleFormOptions): void {
  document.querySelector("#people-modal")?.remove();
  const editing = Boolean(options.person);
  const prefix = options.type;
  const canEdit = !editing || canAction(options.permissions, `${prefix}/edit`);
  const canUpdate =
    !editing || canAction(options.permissions, `${prefix}/update`);
  const readonly = editing && !canUpdate;
  const person = options.person;
  const modal = document.createElement("div");
  modal.id = "people-modal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="people-form-title"><button class="modal-close" type="button" aria-label="Cerrar">×</button><h2 id="people-form-title">${editing ? "Editar" : "Nuevo"} ${options.type === "client" ? "cliente" : "contador"}</h2><form id="people-form"><label>Nombre<input name="firstName" required value="${escapeHtml(person?.firstName ?? "")}" ${readonly ? "readonly disabled" : ""}></label><label>Apellido<input name="lastName" required value="${escapeHtml(person?.lastName ?? "")}" ${readonly ? "readonly disabled" : ""}></label><label>Alias<input name="alias" value="${escapeHtml(person?.alias ?? "")}" ${readonly ? "readonly disabled" : ""}></label><label>Email<input name="email" type="email" required value="${escapeHtml(person?.email ?? "")}" ${readonly ? "readonly disabled" : ""}></label>${editing ? `<label class="status-field">Estado<select class="status-select" name="enabled" aria-label="Estado" ${readonly ? "disabled" : ""}><option value="true" ${person?.enabled ? "selected" : ""}>Activo</option><option value="false" ${person?.enabled === false ? "selected" : ""}>Inactivo</option></select></label>` : ""}<p class="modal-message" role="status" aria-live="polite"></p><div class="modal-actions"><button type="submit" ${!canEdit || !canUpdate ? "disabled" : ""}>${editing ? "Actualizar" : "Crear"}</button><button type="button" class="secondary" data-cancel>Cancelar</button></div></form></section>`;
  document.body.append(modal);
  const close = () => {
    modal.remove();
    options.onClose();
  };
  modal.querySelector(".modal-close")?.addEventListener("click", close);
  modal.querySelector("[data-cancel]")?.addEventListener("click", close);
  modal.querySelector("form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const input = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      alias: String(form.get("alias") ?? ""),
      email: String(form.get("email") ?? ""),
    };
    try {
      if (editing && person)
        await updatePerson(person.id, options.type, {
          ...input,
          enabled: form.get("enabled") === "true",
        });
      else await createPerson({ ...input, type: options.type } as PeopleCreate);
      await options.onSaved();
      close();
    } catch (error) {
      const message = modal.querySelector(".modal-message");
      if (message) {
        message.textContent =
          error instanceof Error
            ? error.message
            : "No se pudo guardar la identidad.";
        message.classList.add("is-error");
      }
    }
  });
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
