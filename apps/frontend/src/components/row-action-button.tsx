const labels = {
  edit: "Editar",
  deactivate: "Desactivar",
  activate: "Activar",
} as const;

export function RowActionButton({
  action,
  onClick,
  disabled,
}: {
  action: keyof typeof labels;
  onClick: () => void;
  disabled?: boolean;
}) {
  const label = labels[action];
  return (
    <button
      type="button"
      className={action === "deactivate" ? "icon-action danger" : "icon-action"}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {action === "edit" ? (
          <>
            <path d="m4 16.5-.8 3.3 3.3-.8L18.2 7.3a2.1 2.1 0 0 0-3-3L4 16.5Z" />
            <path d="m13.8 5.2 3 3" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d={action === "activate" ? "M8 12h8M12 8v8" : "M8 12h8"} />
          </>
        )}
      </svg>
    </button>
  );
}
