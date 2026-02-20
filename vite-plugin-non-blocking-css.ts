/**
 * Build optimizations:
 * - Non-render-blocking CSS (preload + onload)
 * - modulepreload for main JS to start fetch earlier and shorten critical path
 */
import type { Plugin } from 'vite';

export function nonBlockingCss(): Plugin {
  return {
    name: 'non-blocking-css',
    apply: 'build',
    async closeBundle() {
      const path = await import('path');
      const fs = await import('fs');
      const outDir = path.resolve(process.cwd(), 'dist');
      const htmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(htmlPath)) return;
      let html = fs.readFileSync(htmlPath, 'utf-8');

      // 1) Replace render-blocking <link rel="stylesheet"> with preload + onload
      const stylePattern = /<link\s+rel="stylesheet"\s+(?:crossorigin\s+)?href="([^"]+\.css)"\s*\/?>/g;
      html = html.replace(stylePattern, (_, href) =>
        `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
      );

      // 2) Inject modulepreload for main entry script so browser starts fetching earlier
      const scriptMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"|src="([^"]+\.js)"[^>]+type="module"/);
      if (scriptMatch) {
        const scriptHref = scriptMatch[1] || scriptMatch[2];
        const preload = `<link rel="modulepreload" href="${scriptHref}">`;
        html = html.replace(/<head>/i, `<head>\n      ${preload}`);
      }

      fs.writeFileSync(htmlPath, html);
    },
  };
}
