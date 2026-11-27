import { useId, useState } from "react";
import type { FrontendIdentity } from "../auth/session.js";
import type { ClientContext } from "../../../../packages/contracts/navigation.js";
import { clientsPath } from "../../../../packages/contracts/clients.js";
import {
  appRoutes,
  associatesPath,
  canOpenRoute,
  usersPath,
} from "../app/routes.js";
import { clientContextLabel } from "../auth/client-context.js";

type MenuPath = (typeof appRoutes)[number]["path"];

const menuIconPaths: Record<MenuPath, string> = {
  "/home/welcome": "M3 10l9-7 9 7M5 9v11h5v-6h4v6h5V9",
  "/home/client/services": "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h7",
  [clientsPath]: "M3 7h18v13H3zM8 7V4h8v3M3 12c5.5 3 12.5 3 18 0M10 13v3h4v-3",
  [associatesPath]:
    "M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm3-3.9a4 4 0 0 1 0 7.8",
  [usersPath]:
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  "/home/reports/cash-flow": "M3 4v16h18M7 15l5-5 4 3 5-6m-5 0h5v5",
};

export function ReactNavigation({
  identity,
  context,
  onNavigate,
  currentPath,
}: {
  identity: FrontendIdentity;
  context: ClientContext | null;
  onNavigate: (path: string) => void;
  currentPath: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const menuId = useId();
  const toggleLabel = collapsed ? "Expandir menú" : "Colapsar menú";
  const name = context ? clientContextLabel(context) : identity.tenantId;
  const brand = context?.logoUrl ? (
    <img className="brand-logo" src={context.logoUrl} alt="" />
  ) : (
    <span className="brand-mark" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
  const link = (path: MenuPath, label: string) => (
    <a
      key={path}
      className={currentPath === path ? "menu-link active" : "menu-link"}
      aria-current={currentPath === path ? "page" : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      href={path}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onNavigate(path);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={menuIconPaths[path]} />
      </svg>
      <span className="menu-label">{label}</span>
    </a>
  );
  return (
    <aside className={collapsed ? "side-menu collapsed" : "side-menu"}>
      <div className="menu-brand">
        {!collapsed && (
          <>
            {brand}
            <span className="menu-label" title={name}>
              <strong>{name}</strong>
            </span>
          </>
        )}
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={!collapsed}
          aria-controls={menuId}
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            brand
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 5v14m5-7h11m-7-4-4 4 4 4" />
            </svg>
          )}
        </button>
      </div>
      <nav id={menuId} className="menu-links" aria-label="Navegación principal">
        {appRoutes
          .filter(({ path }) => canOpenRoute(identity.permissions, path))
          .map(({ path, label }) => link(path, label))}
      </nav>
    </aside>
  );
}
