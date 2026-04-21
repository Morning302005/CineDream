import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">This reel doesn't exist.</p>
        <a href="/" className="mt-6 inline-block px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CineVault" },
      { name: "description", content: "Search movies, watch trailers, browse cast filmographies and listen to soundtracks." },
      { property: "og:title", content: "CineVault" },
      { property: "og:description", content: "Search movies, watch trailers, browse cast filmographies and listen to soundtracks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { name: "twitter:title", content: "CineVault" },
      { name: "twitter:description", content: "Search movies, watch trailers, browse cast filmographies and listen to soundtracks." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f02e27f-9a40-4a43-aba3-93edc88266a5/id-preview-82516fce--814cee40-dc68-40db-8a0c-91a8deac1a4f.lovable.app-1776753656618.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f02e27f-9a40-4a43-aba3-93edc88266a5/id-preview-82516fce--814cee40-dc68-40db-8a0c-91a8deac1a4f.lovable.app-1776753656618.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}
