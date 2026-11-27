import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client.js";
import { SessionProvider } from "./session-context.js";
import { ClientContextProvider } from "./client-context.js";
import { ReactShell } from "../components/react-shell.js";

export type AppProps = { children?: ReactNode };

export function App({ children }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ClientContextProvider>
          {children ?? <ReactShell />}
        </ClientContextProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
