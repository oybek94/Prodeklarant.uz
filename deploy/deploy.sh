#!/usr/bin/env bash
# Serverni ichida ishlatiladi. Loyiha root papkasida ishga tushiring: ./deploy/deploy.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Root: pnpm install"
if command -v pnpm &>/dev/null; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  npm ci 2>/dev/null || npm install
fi

echo "==> Root: pnpm build"
if command -v pnpm &>/dev/null; then
  pnpm build
else
  npm run build
fi

echo "==> Server: pnpm install"
cd "$ROOT_DIR/server"
if command -v pnpm &>/dev/null; then
  pnpm install
else
  npm install
fi

echo "==> PM2 restart prodeklarant"
cd "$ROOT_DIR"
if command -v pm2 &>/dev/null; then
  pm2 restart prodeklarant || pm2 start server/index.js --name prodeklarant
  pm2 save
else
  echo "PM2 topilmadi. Serverni qo'lda qayta ishga tushiring: node server/index.js"
fi

echo "==> Deploy tugadi."
