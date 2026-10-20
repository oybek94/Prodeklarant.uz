#!/usr/bin/env bash
# Prodeklarant.uz — production'ga deploy (lokal build → serverga yuklash → restart → tekshiruv).
#
# Nega lokal build: serverda devDependencies (vite, sharp) o'rnatilmagan va RAM kam, shuning uchun
# `npm run build` serverda ishlamaydi. Tayyor dist/ va dist-ssr/ yuklanadi.
#
# Ishlatish (Git Bash / WSL / Linux / macOS):
#   DEPLOY_HOST=root@<server-ip> bash scripts/deploy.sh
#   bash scripts/deploy.sh --skip-build      # dist/ va dist-ssr/ tayyor bo'lsa
#   bash scripts/deploy.sh --no-pull         # serverda git pull qilmaslik
#
# Sozlamalar muhit o'zgaruvchilari yoki scripts/deploy.env (gitignore'da) orqali:
#   DEPLOY_HOST   (majburiy)  masalan root@203.0.113.10
#   DEPLOY_KEY    SSH kalit            (default: ~/.ssh/prodeklarant_deploy)
#   DEPLOY_DIR    serverdagi papka     (default: /var/www/prodeklarant.uz)
#   DEPLOY_PM2    pm2 jarayon nomi     (default: prodeklarant)
#   SITE_URL      tekshiriladigan sayt (default: https://prodeklarant.uz)
#
# Xato bo'lsa (restart yoki tekshiruv o'tmasa) eski dist/ va dist-ssr/ avtomatik qaytariladi.

set -euo pipefail

cd "$(dirname "$0")/.."
[ -f scripts/deploy.env ] && . scripts/deploy.env

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_KEY="${DEPLOY_KEY:-$HOME/.ssh/prodeklarant_deploy}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/prodeklarant.uz}"
DEPLOY_PM2="${DEPLOY_PM2:-prodeklarant}"
SITE_URL="${SITE_URL:-https://prodeklarant.uz}"

SKIP_BUILD=0
NO_PULL=0
for a in "$@"; do
  case "$a" in
    --skip-build) SKIP_BUILD=1 ;;
    --no-pull) NO_PULL=1 ;;
    *) echo "Noma'lum parametr: $a" >&2; exit 2 ;;
  esac
done

if [ -z "$DEPLOY_HOST" ]; then
  echo "DEPLOY_HOST berilmagan (masalan: DEPLOY_HOST=root@<server-ip> bash scripts/deploy.sh)" >&2
  exit 2
fi
[ -f "$DEPLOY_KEY" ] || { echo "SSH kalit topilmadi: $DEPLOY_KEY" >&2; exit 2; }

SSH=(ssh -i "$DEPLOY_KEY" -o BatchMode=yes -o ConnectTimeout=15)
SCP=(scp -i "$DEPLOY_KEY" -o BatchMode=yes -o ConnectTimeout=15)
ARCHIVE="$(mktemp -t pd-build.XXXXXX).tgz"
trap 'rm -f "$ARCHIVE"' EXIT

echo "==> 1/6 Git holati"
if [ -n "$(git status --porcelain)" ]; then
  echo "Commit qilinmagan o'zgarishlar bor — avval commit qiling." >&2
  git status --short >&2
  exit 1
fi
HEAD_SHA="$(git rev-parse --short HEAD)"
# Server `git pull origin main` qiladi: HEAD main'da bo'lmasa, serverda eski kod qoladi.
git fetch -q origin main
if ! git merge-base --is-ancestor HEAD origin/main; then
  echo "Ogohlantirish: $HEAD_SHA origin/main'da yo'q. Server main'dan oladi — avval main'ga push qiling (--no-pull bilan faqat dist yuklanadi)." >&2
  [ "$NO_PULL" -eq 1 ] || exit 1
fi

echo "==> 2/6 Build ($HEAD_SHA)"
if [ "$SKIP_BUILD" -eq 0 ]; then
  npm run build
else
  echo "    o'tkazib yuborildi (--skip-build)"
fi
[ -f dist/index.html ] && [ -f dist-ssr/entry-server.js ] || { echo "dist/ yoki dist-ssr/ topilmadi" >&2; exit 1; }

echo "==> 3/6 Arxivlash"
tar -czf "$ARCHIVE" dist dist-ssr
ls -lh "$ARCHIVE" | awk '{print "    "$5}'

echo "==> 4/6 Yuklash"
REMOTE_TMP="/tmp/pd-build-$HEAD_SHA.tgz"
"${SCP[@]}" "$ARCHIVE" "$DEPLOY_HOST:$REMOTE_TMP"

echo "==> 5/6 Serverda almashtirish va restart"
"${SSH[@]}" "$DEPLOY_HOST" bash -s -- "$DEPLOY_DIR" "$DEPLOY_PM2" "$REMOTE_TMP" "$NO_PULL" <<'REMOTE'
set -euo pipefail
DIR="$1"; PM2_NAME="$2"; TMP="$3"; NO_PULL="$4"
cd "$DIR"

if [ "$NO_PULL" != "1" ]; then
  git pull --ff-only origin main 2>&1 | tail -2
fi

rm -rf .stage dist.prev-deploy dist-ssr.prev-deploy
mkdir .stage
tar -xzf "$TMP" -C .stage
mv dist dist.prev-deploy
mv dist-ssr dist-ssr.prev-deploy
mv .stage/dist dist
mv .stage/dist-ssr dist-ssr
rmdir .stage
rm -f "$TMP"

rollback() {
  echo "XATO — eski build qaytarilmoqda" >&2
  rm -rf dist dist-ssr
  mv dist.prev-deploy dist
  mv dist-ssr.prev-deploy dist-ssr
  pm2 restart "$PM2_NAME" >/dev/null 2>&1 || true
}

pm2 restart "$PM2_NAME" >/dev/null
sleep 3
CODE="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/ || true)"
if [ "$CODE" != "200" ]; then
  echo "Lokal tekshiruv: HTTP $CODE" >&2
  rollback
  exit 1
fi
echo "    pm2 restart OK, lokal HTTP $CODE"
REMOTE

echo "==> 6/6 Ochiq sayt tekshiruvi"
CODE="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL/" || true)"
if [ "$CODE" != "200" ]; then
  echo "$SITE_URL → HTTP $CODE. Eski build'ni qaytarish: serverda" >&2
  echo "  cd $DEPLOY_DIR && rm -rf dist dist-ssr && mv dist.prev-deploy dist && mv dist-ssr.prev-deploy dist-ssr && pm2 restart $DEPLOY_PM2" >&2
  exit 1
fi
echo "    $SITE_URL → HTTP $CODE"
echo "Tayyor: $HEAD_SHA deploy qilindi. Eski build serverda: dist.prev-deploy, dist-ssr.prev-deploy"
