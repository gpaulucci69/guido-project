import { ErrorState, LoadingState, Modal } from "./ui-states.js";
import { useEffect, useRef, useState } from "react";
import type { FrontendIdentity } from "../auth/session.js";
import { fallbackAlias, initials } from "../auth/profile-normalization.js";
import { logout } from "../auth/oidc-client.js";
import { accessToken } from "../auth/session.js";
import { createApiClient } from "../lib/api/client.js";
import type { UserProfile } from "../auth/profile.js";
import { useProfile } from "../hooks/use-profile.js";

const profileApi = createApiClient({
  baseUrl: `${window.location.protocol}//${window.location.hostname}:3001/api/v1`,
  getToken: accessToken,
});

export function ReactHeader({ identity }: { identity: FrontendIdentity }) {
  const profile = useProfile(identity);
  const displayIdentity = profile.data ?? identity;
  const avatarUrl = profile.data?.avatarUrl;
  const [failedAvatar, setFailedAvatar] = useState<string>();
  const photoUrl = avatarUrl === failedAvatar ? undefined : avatarUrl;
  const label = fallbackAlias({
    firstName: displayIdentity.firstName,
    lastName: displayIdentity.lastName,
    alias: displayIdentity.alias,
  });
  const fullName = [
    displayIdentity.firstName.trim(),
    displayIdentity.lastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");
  const email = profile.data?.email?.trim() || identity.email?.trim();
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);
  return (
    <header className="header">
      <div className="account-tools" ref={menuRef}>
        <span className="account-alias">{label}</span>
        <button
          type="button"
          className="notification-button"
          aria-label="Notificaciones"
          title="Notificaciones"
          disabled
        >
          🔔
        </button>
        <button
          type="button"
          className={`avatar-button user-avatar ${photoUrl ? "user-avatar-photo" : "user-initials"}`}
          aria-label={`Abrir menú de ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              onError={() => setFailedAvatar(photoUrl)}
            />
          ) : (
            initials(displayIdentity)
          )}
        </button>
        {open && (
          <div className="account-menu" role="menu">
            <div className="account-menu-identity">
              <strong>{fullName || label}</strong>
              {email && <span>{email}</span>}
            </div>
            <div className="account-menu-roles">
              <span className="eyebrow">ROLES</span>
              {identity.roles.length ? (
                identity.roles.map((role) => (
                  <span key={role} className="account-role">
                    {role}
                  </span>
                ))
              ) : (
                <span>Sin roles asignados</span>
              )}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setProfileOpen(true);
              }}
            >
              Editar perfil
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setPasswordOpen(true);
              }}
            >
              Restablecer tu clave
            </button>
            <button type="button" role="menuitem" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      {profileOpen &&
        (profile.data ? (
          <ProfileModal
            profile={profile.data}
            save={profile.updateProfile}
            onClose={() => setProfileOpen(false)}
          />
        ) : (
          <Modal title="Editar perfil" onClose={() => setProfileOpen(false)}>
            {profile.isPending ? (
              <LoadingState label="Cargando perfil…" />
            ) : (
              <ErrorState message="No se pudo cargar el perfil." />
            )}
          </Modal>
        ))}
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
    </header>
  );
}

function ProfileModal({
  onClose,
  profile,
  save,
}: {
  onClose: () => void;
  profile: UserProfile;
  save: ReturnType<typeof useProfile>["updateProfile"];
}) {
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    alias: profile.alias,
    avatar: undefined as File | undefined,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await save({
        firstName: form.firstName,
        lastName: form.lastName,
        alias: form.alias,
        ...(form.avatar ? { avatar: form.avatar } : {}),
      });
      onClose();
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "No se pudo actualizar el perfil.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal title="Editar perfil" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Nombre
          <input
            required
            disabled={saving}
            value={form.firstName}
            onChange={(event) =>
              setForm({ ...form, firstName: event.target.value })
            }
          />
        </label>
        <label>
          Apellido
          <input
            required
            disabled={saving}
            value={form.lastName}
            onChange={(event) =>
              setForm({ ...form, lastName: event.target.value })
            }
          />
        </label>
        <label>
          Alias
          <input
            disabled={saving}
            value={form.alias}
            onChange={(event) =>
              setForm({ ...form, alias: event.target.value })
            }
          />
        </label>
        <label>
          Avatar
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={saving}
            onChange={(event) =>
              setForm({ ...form, avatar: event.target.files?.[0] })
            }
          />
        </label>
        {message && (
          <p role="status" className="modal-message">
            {message}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cerrar
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Actualizar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setMessage("La clave debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Las claves no coinciden.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await profileApi<void>("/profile/password", {
        method: "PATCH",
        body: JSON.stringify({ password, confirmation }),
      });
      setMessage("La clave se actualizó correctamente.");
      setPassword("");
      setConfirmation("");
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "No se pudo actualizar la clave.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal title="Restablecer tu clave" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Nueva clave
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Repetir nueva clave
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        {message && (
          <p role="status" className="modal-message">
            {message}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Actualizando…" : "Actualizar clave"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
