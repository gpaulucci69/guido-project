import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "./session-context.js";
import { loadClientContext } from "../auth/client-context.js";
import type { ClientContext } from "../../../../packages/contracts/navigation.js";

const ClientContextState = createContext<ClientContext | null>(null);

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const { identity } = useSession();
  const { data } = useQuery({
    queryKey: ["client-context", identity?.tenantId, identity?.sub],
    queryFn: loadClientContext,
    enabled: Boolean(identity),
  });
  return (
    <ClientContextState.Provider value={identity ? (data ?? null) : null}>
      {children}
    </ClientContextState.Provider>
  );
}

export function useClientContext(): ClientContext | null {
  return useContext(ClientContextState);
}
