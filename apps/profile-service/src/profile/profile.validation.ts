const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
export const maxAvatarBytes = 5 * 1024 * 1024;

export function validateText(
  value: string | undefined,
  field: string,
): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (normalized.length > 120)
    throw new Error(`${field} no puede superar los 120 caracteres.`);
  return normalized;
}

export function validateAvatar(file: {
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}): { extension: string } {
  const extension = allowed.get(file.mimeType);
  if (!extension) throw new Error("El avatar debe ser JPEG, PNG o WebP.");
  if (file.bytes.byteLength > maxAvatarBytes)
    throw new Error("El avatar no puede superar los 5 MB.");
  const lower = file.filename.toLowerCase();
  if (
    !lower.endsWith(`.${extension}`) &&
    !(extension === "jpg" && lower.endsWith(".jpeg"))
  )
    throw new Error("La extensión del avatar no coincide con su tipo.");
  if (!validMagic(file.bytes, file.mimeType))
    throw new Error("El contenido del avatar no coincide con su tipo.");
  return { extension };
}

function validMagic(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg")
    return (
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9
    );
  if (mime === "image/png")
    return bytes
      .slice(0, 8)
      .every(
        (value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index],
      );
  return (
    new TextDecoder().decode(bytes.slice(0, 12)).startsWith("RIFF") &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  );
}

export function avatarObjectKey(
  tenantId: string,
  sub: string,
  extension: string,
): string {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `profiles/${safe(tenantId)}/${safe(sub)}/avatar.${extension}`;
}
