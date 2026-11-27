import { useEffect, useId, useRef, type ReactNode } from "react";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <p role="status" className="ui-state ui-state-loading">
      {label}
    </p>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="ui-state ui-state-empty">{message}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="ui-state ui-state-error">
      {message}
    </p>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        className="modal-close"
        aria-label="Cerrar"
        onClick={onClose}
      >
        ×
      </button>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
