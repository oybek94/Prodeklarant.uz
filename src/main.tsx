import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, matchRoutes } from "react-router";
import App from "./app/App.tsx";
import { routes } from "./app/routes.tsx";
import "./i18n";
import "./styles/index.css";

// Server (SSR) sahifani to'liq HTML bilan yuborgan bo'lsa — hydrate qilamiz; loader
// ma'lumotlari window.__staticRouterHydrationData dan avtomatik olinadi.
// Aks holda (vite dev, admin, SSR xatosi) — oddiy client render.
async function start() {
  const container = document.getElementById("root")!;
  const router = createBrowserRouter(routes);

  if (container.firstElementChild) {
    // Joriy sahifaning lazy chunk'ini hydration'dan oldin yuklaymiz (routes.tsx: lazyPage)
    const matches = matchRoutes(routes, window.location) ?? [];
    await Promise.all(
      matches.map((m) => (m.route.handle as { preload?: () => Promise<void> } | undefined)?.preload?.())
    ).catch(() => undefined);
    hydrateRoot(container, <App router={router} />);
  } else {
    createRoot(container).render(<App router={router} />);
  }
}

start();
