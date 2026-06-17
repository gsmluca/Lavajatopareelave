import { trpc } from "@/lib/trpc";

// Mensagem de erro de autenticação - deve corresponder ao backend
const UNAUTHED_ERR_MSG = "Please login (10001)";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/trpc`,
      transformer: superjson,
      fetch(input, init) {
        const token = localStorage.getItem("auth_token");

        // For batch requests, we need to ensure the body is correctly formatted
        // tRPC v11 batch format: {"id":"1","method":"mutation","params":{"json":{"vehicleType":"car",...}}}
        // But the backend expects: {"json":{"vehicleType":"car",...}} for individual requests
        // We'll use a custom fetch that ensures correct format
        const body = init?.body ? JSON.parse(init.body as string) : {};

        // If this is a batch request, we need to reformat the body
        if (Array.isArray(body)) {
          // Convert batch format to individual request format
          const newBody = body.map(item => {
            if (item.params && item.params.json) {
              return item.params.json;
            }
            return item;
          });

          // Send as individual request instead of batch
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(newBody[0]), // Send only first item as individual request
          });
        }

        // For non-batch requests, send normally
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers ?? {}),
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
