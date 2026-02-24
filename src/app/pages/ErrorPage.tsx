import { useRouteError, Link, isRouteErrorResponse } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home, ArrowRight, RefreshCw } from 'lucide-react';

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message || '';
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('Importing a module script failed')
    );
  }
  return false;
}

export function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();
  const chunkError = isChunkLoadError(error);

  const title = chunkError ? t('error.chunkTitle') : t('error.title');
  const message = chunkError ? t('error.chunkMessage') : t('error.message');

  const status = isRouteErrorResponse(error) ? error.status : null;
  const statusText = isRouteErrorResponse(error) ? error.statusText : null;
  const errorDetail = error instanceof Error ? error.message : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-8 py-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(250,204,21,0.12),transparent)]" aria-hidden="true" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 text-red-300 mb-6">
              <AlertTriangle size={40} strokeWidth={1.5} />
            </div>
            {status != null && (
              <p className="text-5xl md:text-6xl font-black text-white tracking-tighter tabular-nums">{status}</p>
            )}
            <p className="text-slate-300 font-semibold uppercase tracking-widest text-sm mt-2">
              {statusText || t('error.oops')}
            </p>
          </div>
        </div>
        <div className="px-8 py-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{title}</h1>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto">{message}</p>
          {errorDetail && !chunkError && (
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto font-mono break-all" role="alert">
              {errorDetail}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {chunkError && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold uppercase tracking-wide px-6 py-3 rounded-xl hover:bg-blue-900 hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <RefreshCw size={18} />
                {t('error.tryAgain')}
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold uppercase tracking-wide px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-blue-900 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              <Home size={20} />
              {t('error.backHome')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center text-slate-500 text-sm mt-8">
        <Link to="/contact" className="underline hover:text-blue-900">
          {t('error.needHelp')}
        </Link>
      </p>
    </div>
  );
}
