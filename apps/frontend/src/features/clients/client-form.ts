import type { ClientCreate, ClientSummary, ClientUpdate } from "../../../../../packages/contracts/clients.js";
import { createClient, updateClient } from "./clients-api";

export function openClientForm(options: { client?: ClientSummary; onSaved: () => void; onClose: () => void }): void {
  document.querySelector("#client-form-modal")?.remove();
  const editing = Boolean(options.client);
  const client = options.client;
  const modal = document.createElement("div");
  modal.id = "client-form-modal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="client-form-title"><button class="modal-close" type="button" aria-label="Cerrar">×</button><h2 id="client-form-title">${editing ? "Editar cliente" : "Nuevo cliente"}</h2>${editing ? "" : '<label>Tipo<select name="type"><option value="INDIVIDUAL">Persona física</option><option value="LEGAL_ENTITY">Persona moral</option></select></label>'}<form><div data-fields></div><p class="modal-message" role="status" aria-live="polite"></p><div class="modal-actions"><button type="submit">${editing ? "Actualizar" : "Crear"}</button><button type="button" class="secondary" data-cancel>Cancelar</button></div></form></section>`;
  document.body.append(modal);
  const formElement = modal.querySelector<HTMLFormElement>("form");
  const typeSelector = modal.querySelector("select[name=type]")?.closest("label");
  if (formElement && typeSelector) formElement.prepend(typeSelector);
  const fields = modal.querySelector<HTMLElement>("[data-fields]");
  const renderFields = (type: ClientCreate["type"]) => {
    if (!fields) return;
    fields.innerHTML = type === "INDIVIDUAL" ? '<label>Nombre<input name="firstName" required></label><label>Apellido<input name="lastName" required></label><label>CUIT<input name="cuit" required></label><label>Email<input name="email" type="email"></label>' : '<label>Razón social<input name="legalName" required></label><label>CUIT<input name="cuit" required></label><label>Nombre comercial<input name="tradeName"></label><label>Email<input name="email" type="email"></label><label>Representante legal<input name="legalRepresentativeName"></label><label>CUIT representante<input name="legalRepresentativeTaxId"></label>';
  };
  renderFields(editing ? (client?.type ?? "INDIVIDUAL") : "INDIVIDUAL");
  if (client) {
    modal.querySelectorAll<HTMLInputElement>("input[name]").forEach((input) => {
      const value = client[input.name as keyof ClientSummary];
      input.value = typeof value === "string" ? value : "";
      if (input.name === "cuit") input.disabled = true;
    });
  }
  modal.querySelector<HTMLSelectElement>("select[name=type]")?.addEventListener("change", (event) => renderFields((event.target as HTMLSelectElement).value as ClientCreate["type"]));
  const close = () => { modal.remove(); options.onClose(); };
  modal.querySelector(".modal-close")?.addEventListener("click", close);
  modal.querySelector("[data-cancel]")?.addEventListener("click", close);
  modal.querySelector("form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement).entries());
    try {
      if (editing && client) await updateClient(client.id, { ...form, updatedAt: client.updatedAt } as ClientUpdate);
      else await createClient(form as unknown as ClientCreate);
      options.onSaved(); close();
    } catch (error) { const message = modal.querySelector(".modal-message"); if (message) message.textContent = error instanceof Error ? error.message : "No se pudo guardar el cliente."; }
  });
}
