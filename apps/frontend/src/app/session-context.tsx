import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  completeLogin,
  sessionIdentity,
  type FrontendIdentity,
} from "../auth/session.js";

let loginCallback: Promise<unknown> | undefined;

async function initializeSession() {
  if (window.location.pathname === "/auth/callback") {
    loginCallback ??= completeLogin();
    try {
      await loginCallback;
    } finally {
      window.history.replaceState(null, "", "/home/welcome");
    }
  }
  return sessionIdentity();
}

type SessionState = {
  status: "loading" | "authenticated" | "anonymous" | "error";
  identity: FrontendIdentity | null;
  error?: string;
};
const SessionContext = createContext<SessionState>({
  status: "loading",
  identity: null,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    identity: null,
  });
  useEffect(() => {
    let active = true;
    void initializeSession()
      .then((identity) => {
        if (active)
          setState({
            status: identity ? "authenticated" : "anonymous",
            identity,
          });
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            status: "error",
            identity: null,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo cargar la sesión.",
          });
      });
    return () => {
      active = false;
    };
  }, []);
  const value = useMemo(() => state, [state]);
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  return useContext(SessionContext);
}
