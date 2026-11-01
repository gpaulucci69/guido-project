import { fallbackAlias } from "../../auth/profile-normalization.js";

export function welcomeName(firstName: string, lastName: string): string {
  return fallbackAlias({ firstName, lastName, alias: "" });
}

export function renderWelcome(firstName: string, lastName: string): string {
  return `<section class="welcome-view"><span class="eyebrow">INICIO</span><h1>Bienvenido ${escapeHtml(welcomeName(firstName, lastName))}</h1><p>Este es tu espacio de trabajo en SAAS Contable.</p></section>`;
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
