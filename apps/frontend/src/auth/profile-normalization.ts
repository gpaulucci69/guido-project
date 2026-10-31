export type IdentityProfile = {
  firstName: string;
  lastName: string;
  alias: string;
};

export function initials(
  profile: Pick<IdentityProfile, "firstName" | "lastName">,
): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "U";
}

export function fallbackAlias(profile: IdentityProfile): string {
  if (profile.alias.trim()) return profile.alias.trim();
  return (
    [profile.firstName.trim(), profile.lastName.trim()]
      .filter(Boolean)
      .join(" ") || "Usuario"
  );
}
