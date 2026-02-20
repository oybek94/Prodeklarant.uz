/**
 * Makes the main stylesheet load non-render-blocking by using
 * preload + onload pattern. Reduces LCP impact of render-blocking CSS.
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
      // Replace render-blocking <link rel="stylesheet"> with preload + onload pattern
      const stylePattern = /<link\s+rel="stylesheet"\s+(?:crossorigin\s+)?href="([^"]+\.css)"\s*\/?>/g;
      html = html.replace(stylePattern, (_, href) =>
        `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
      );
      fs.writeFileSync(htmlPath, html);
    },
  };
}
