export type PermissionType = "route" | "action";

export type Permission = {
  type: PermissionType;
  value: string;
};

type RawPermission = {
  type?: unknown;
  value?: unknown;
};

type AuthorizationClaims = {
  routes?: unknown;
  actions?: unknown;
};

function normalizedValue(type: PermissionType, value: string): string {
  const trimmed = value.trim();
  if (type === "route")
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return trimmed.replace(/^\/+/, "");
}

export function normalizePermissions(
  input: unknown,
  warn: (message: string) => void = (message) => console.warn(message),
): Permission[] {
  const values: Array<{ type: PermissionType; value: unknown }> = [];

  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as RawPermission;
      if (candidate.type === "route" || candidate.type === "action")
        values.push({ type: candidate.type, value: candidate.value });
    }
  } else if (input && typeof input === "object") {
    const authorization = input as AuthorizationClaims;
    if (Array.isArray(authorization.routes))
      for (const value of authorization.routes)
        values.push({ type: "route", value });
    if (Array.isArray(authorization.actions))
      for (const value of authorization.actions)
        values.push({ type: "action", value });
  }

  const seen = new Set<string>();
  const result: Permission[] = [];

  for (const item of values) {
    if (typeof item.value !== "string" || item.value.trim() === "") {
      warn(`Permiso ignorado por formato inválido: ${item.type}`);
      continue;
    }

    const permission = {
      type: item.type,
      value: normalizedValue(item.type, item.value),
    } satisfies Permission;
    const key = `${permission.type}:${permission.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(permission);
  }

  return result;
}
