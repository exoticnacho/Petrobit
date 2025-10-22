import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";

const Head = () => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    
    {/* FIX KRITIS CSP DI SINI */}
    <meta 
        httpEquiv="Content-Security-Policy" 
        content="default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
    />
    
    <title>Petrobit</title>
  </>
);

// Menggunakan fungsi tanpa tipe eksplisit untuk menghindari error compatibility
export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Press+Start+2P&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Inisialisasi QueryClient di dalam komponen
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              fontFamily: '"Press Start 2P", cursive',
              fontSize: "10px",
              padding: "12px",
              border: "3px solid hsl(var(--border))",
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.25)",
            },
          }}
        />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Menggunakan 'any' untuk ErrorBoundaryProps agar kompilasi berhasil
export function ErrorBoundary({ error }: any) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
