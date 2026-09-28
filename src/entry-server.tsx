import { PassThrough } from 'node:stream';
import type { ReactElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AppShell } from './app/App';
import { routes } from './app/routes';
import { localeFromPath } from './app/utils/locale';
import type { DataContext } from './app/data';

/**
 * Server-side render (Express: server/ssr.js). Build: `vite build --ssr src/entry-server.tsx`.
 *
 * Maqsad — qidiruv tizimlari (ayniqsa Yandex) JS'siz ham to'liq matn, H1 va havolalarni
 * ko'rishi. Brauzer keyin shu HTML'ni hydrate qiladi (src/main.tsx).
 */
const handler = createStaticHandler(routes);

export type RenderResult =
  | { html: string; status: number }
  | { redirect: string; status: number };

export async function render(
  url: string,
  opts: { data: DataContext; nonce?: string; timeoutMs?: number }
): Promise<RenderResult> {
  const request = new Request(url, { method: 'GET' });
  const context = await handler.query(request, { requestContext: opts.data });
  if (context instanceof Response) {
    return { redirect: context.headers.get('Location') || '/', status: context.status };
  }

  // Har so'rov uchun alohida i18n nusxasi — parallel so'rovlarda tillar aralashmasin.
  const lng = localeFromPath(new URL(url).pathname);
  const i18nInstance = i18n.cloneInstance({ lng, initAsync: false });
  await i18nInstance.changeLanguage(lng);

  const router = createStaticRouter(handler.dataRoutes, context);
  const html = await renderComplete(
    <I18nextProvider i18n={i18nInstance}>
      <AppShell>
        <StaticRouterProvider router={router} context={context} nonce={opts.nonce} />
      </AppShell>
    </I18nextProvider>,
    opts.nonce,
    opts.timeoutMs ?? 5000
  );
  return { html, status: context.statusCode };
}

/** Barcha Suspense/lazy qismlar tayyor bo'lgach (onAllReady) to'liq HTML qatorini qaytaradi. */
function renderComplete(element: ReactElement, nonce: string | undefined, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new PassThrough();
    sink.on('data', (c: Buffer) => chunks.push(c));
    sink.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    sink.on('error', reject);

    let ready = false;
    const stream = renderToPipeableStream(element, {
      nonce,
      onAllReady() {
        ready = true;
        clearTimeout(timer);
        stream.pipe(sink);
      },
      onShellError(err) {
        clearTimeout(timer);
        reject(err);
      },
      onError(err) {
        console.error('[ssr] render error:', err);
      },
    });
    const timer = setTimeout(() => {
      if (!ready) {
        stream.abort();
        reject(new Error(`SSR timeout (${timeoutMs} ms)`));
      }
    }, timeoutMs);
  });
}
