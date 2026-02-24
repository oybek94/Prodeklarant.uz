# Prodeklarant.uz — serverga deploy qilish

Ushbu hujjat loyihani production serverga (masalan, prodeklarant.uz domenida) joylash uchun aniq qadamlarni tavsiflaydi. app.prodeklarant.uz loyihasiga ta'sir qilmaydi: boshqa port (3002) va alohida Nginx server bloki ishlatiladi.

---

## 1. Serverni tekshirish

Quyidagi dasturlar o'rnatilgan bo'lishi kerak:

- **Node.js** 18 yoki undan yuqori: `node -v`
- **pnpm**: `pnpm -v` (yoki `npm install -g pnpm`)
- **PM2**: `pm2 -v` (global: `npm install -g pm2`)
- **Nginx**: `nginx -v`

Agar biror narsa yo'q bo'lsa (Ubuntu/Debian misolida):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm pm2
sudo apt-get install -y nginx
```

---

## 2. Loyiha papkasi

Serverda loyiha uchun papka yarating va egasini o'rnating (masalan, `deploy` foydalanuvchisi):

```bash
sudo mkdir -p /var/www/prodeklarant.uz
sudo chown $USER:$USER /var/www/prodeklarant.uz
cd /var/www/prodeklarant.uz
```

Boshqa yo'l ishlatilsa (masalan `/home/deploy/prodeklarant.uz`), keyingi barcha `/var/www/prodeklarant.uz` o'rniga shu yo'lni yozing.

---

## 3. Kodni yuklash

**Variant A — Git orqali:**

```bash
cd /var/www/prodeklarant.uz
git clone <repository-url> .
# yoki mavjud repo bo'lsa: git pull
```

**Variant B — Fayllarni qo'lda yuklash:**

Loyiha fayllarini (root `package.json`, `src/`, `server/`, `public/`, `deploy/`, `vite.config.ts` va boshqalar) serverdagi `/var/www/prodeklarant.uz` ga yuklang. `deploy/` papkasi va ichidagi `deploy.sh`, `nginx-prodeklarant.uz.conf` borligini tekshiring.

---

## 4. Server .env sozlash

```bash
cd /var/www/prodeklarant.uz/server
cp .env.example .env
nano .env   # yoki boshqa muharrir
```

Quyidagilarni o'zgartiring:

- `ADMIN_PASSWORD` — admin panel paroli (mustahkam qiling).
- `JWT_SECRET` — uzoq va tasodifiy qator (production da default qoldirmang).
- `PORT=3002` — Express porti (app.prodeklarant.uz boshqa portda bo'lsa, 3002 qulay).
- Ixtiyoriy: `CORS_ORIGIN` — qo'shimcha domenlar kerak bo'lsa, vergul bilan.

Saqlang va chiqing.

---

## 5. Birinchi build va dependency’lar

Loyiha root papkasida:

```bash
cd /var/www/prodeklarant.uz
pnpm install
pnpm build
```

**Rasmlarni optimallashtirish (ixtiyoriy):** LCP va trafikni kamaytirish uchun **loyiha root** da (`/var/www/prodeklarant.uz`, `server/` emas) build oldidan `pnpm run optimize-images` ishlating — logo va hamkorlar logotiplari uchun WebP va qisqargan o‘lchamlar yaratiladi (~969 KiB tejash).

Server papkasida:

```bash
cd /var/www/prodeklarant.uz/server
pnpm install
# yoki: npm install
```

`dist/` papkasi yaratilgan va `server/node_modules` mavjud bo'lishi kerak.

---

## 6. PM2 bilan ishga tushirish

```bash
cd /var/www/prodeklarant.uz
pm2 start server/index.js --name prodeklarant
pm2 save
pm2 startup
```

So'nggi buyruq chiqaradigan `sudo env PATH=...` buyruqni nusxalab bajaring. Keyin server qayta yuklansa ham prodeklarant avtomatik ishga tushadi.

Portni tekshirish: `curl -s http://127.0.0.1:3002` — javob yoki xato bo'lsa ham server ishlayapti.

---

## 7. Nginx sozlash

```bash
sudo cp /var/www/prodeklarant.uz/deploy/nginx-prodeklarant.uz.conf /etc/nginx/sites-available/prodeklarant.uz
sudo ln -s /etc/nginx/sites-available/prodeklarant.uz /etc/nginx/sites-enabled/
```

Konfigda port 3002 ekanligini tekshiring; agar siz boshqa port ishlatgan bo'lsangiz, `proxy_pass http://127.0.0.1:3002` ni o'sha portga o'zgartiring.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. DNS

Domen **prodeklarant.uz** ni serveringizga yo‘naltirish uchun DNS yozuvlarini sozlashingiz kerak. Buning uchun domen qayerda ro‘yxatdan o‘tgan bo‘lsa (Uzinfocom, Reg.ru, Cloudflare va boshqalar), u yerning "DNS sozlamalari" / "Domain management" / "Yozuvlar" bo‘limiga kirasiz.

### Nima qo‘shish kerak?

| Turi | Name / Host | Qiymat (Value) | Izoh |
|------|-------------|----------------|------|
| **A** | `@` yoki `prodeklarant.uz` yoki bo‘sh qoldirish | **Server IP manzilingiz** (masalan `123.45.67.89`) | Asosiy domen (prodeklarant.uz) shu IP ga yo‘naladi. |
| **A** yoki **CNAME** | `www` | **Server IP** (A uchun) yoki `prodeklarant.uz` (CNAME uchun) | www.prodeklarant.uz ham shu serverga boradi. |

- **A yozuvi** — domen yoki subdomenni **to‘g‘ridan-to‘g‘ri IP manzilga** bog‘laydi. Asosiy domen uchun A yozuvi kerak.
- **CNAME yozuvi** — bir domenni **boshqa domen nomiga** yo‘naltiradi. `www` uchun CNAME qilsangiz, qiymat: `prodeklarant.uz` (nuqta bo‘lmasa ham bo‘ladi, provider qo‘shib beradi).

### Qadamlar (umumiy)

1. Serveringizning **tashqi (public) IP** manzilini biling: `curl -4 ifconfig.me` yoki VPS panelida ko‘rsatiladi.
2. Domen provayderingizda DNS boshqaruviga kiring.
3. **A yozuvi** qo‘shing: Name = `@` (yoki "prodeklarant.uz" / blank), Type = A, Value = server IP.
4. **www** uchun:
   - **A yozuvi**: Name = `www`, Type = A, Value = xuddi shu server IP;
   - **yoki CNAME**: Name = `www`, Type = CNAME, Value = `prodeklarant.uz`.
5. Saqlang. O‘zgarishlar 5–60 daqiqa (ba’zan bir necha soat) ichida butun internetga tarqaladi — buni **propagatsiya** deyiladi.

### Misol (so‘zlar provider’dan farq qilishi mumkin)

- **Uzinfocom** (uz domenlar): "DNS records" / "Yozuvlar" → A: host `@` → IP; yana A yoki CNAME: host `www` → IP yoki `prodeklarant.uz`.
- **Cloudflare**: DNS → Add record → Type A, Name `@`, IPv4 address = server IP; yana A yoki CNAME, Name `www`.
- **Reg.ru, Nic.ru**: "Zona yozuvlari" / "DNS records" → A yozuvi qo‘shish, keyin www uchun A yoki CNAME.

Saqlagach, bir necha daqiqa yoki soatdan keyin brauzerda `http://prodeklarant.uz` va `http://www.prodeklarant.uz` serveringizdagi saytni ko‘rsatishi kerak. Keyin 9-qadamda SSL (HTTPS) ni yoqasiz.

---

## 9. SSL (HTTPS)

Certbot o'rnatilgan bo'lsa:

```bash
sudo certbot --nginx -d prodeklarant.uz -d www.prodeklarant.uz
```

Ko'rsatmalarga amal qiling. Nginx avtomatik 443 sozlanadi.

---

## 10. Tekshirish

- Brauzerda: https://prodeklarant.uz
- Bosh sahifa, /blog, /admin (login paroli — .env dagi ADMIN_PASSWORD).
- Rasm yuklash va maqolalar ishlashini tekshiring.

---

## 504 Gateway Timeout — tarjima / API

Katta maqolani tarjima qilganda `/api/translate` 504 qaytarsa — Nginx proxy vaqti (odatda 60 s) tugadi. **Nginx** da API uchun timeout ni oshiring.

`/etc/nginx/sites-available/prodeklarant.uz` (yoki prodeklarant.uz server bloki) ichida `location /` yoki proxy qiladigan `location` da quyidagilarni qo‘shing:

```nginx
location / {
  proxy_pass http://127.0.0.1:3002;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_connect_timeout 120s;
  proxy_send_timeout 120s;
  proxy_read_timeout 120s;
}
```

Keyin: `sudo nginx -t` va `sudo systemctl reload nginx`. 120 s dan ko‘p vaqt kerak bo‘lsa, `120s` ni masalan `180s` qiling.

---

## 502 Bad Gateway — nima qilish

Nginx 502 berayotgan bo‘lsa, odatda **Node ilovasi ishlamayapti** yoki **port mos kelmayapti**. Serverni SSH orqali ulang va quyidagilarni ketma-ket bajaring.

### 1. PM2 va portni tekshirish

```bash
pm2 status
```

**prodeklarant** `online` bo‘lishi kerak. Agar `stopped` yoki `errored` bo‘lsa:

```bash
pm2 logs prodeklarant --lines 50
```

Xatolik matniga qarang (masalan, `EADDRINUSE`, `Cannot find module`, `better-sqlite3` binding).

### 2. Portni tekshirish

Ilova qaysi portda tinglayotganini bilish:

```bash
sudo ss -tlnp | grep -E '3001|3002'
# yoki
sudo lsof -i :3002
```

Nginx konfigida qaysi port ko‘rsatilganini tekshiring:

```bash
grep proxy_pass /etc/nginx/sites-enabled/prodeklarant.uz
```

`proxy_pass http://127.0.0.1:3002` bo‘lishi kerak. Agar Nginx **3002** ga yo‘naltirsa, Node ham **3002** da ishlashi kerak.

### 3. Node porti — server/.env

```bash
cat /var/www/prodeklarant.uz/server/.env | grep PORT
```

`PORT=3002` bo‘lishi kerak. Agar yo‘q yoki boshqa port bo‘lsa:

```bash
cd /var/www/prodeklarant.uz/server
echo "PORT=3002" >> .env
# yoki .env ni tahrirlab PORT=3002 qiling
```

Keyin PM2 ni qayta ishga tushiring:

```bash
cd /var/www/prodeklarant.uz
pm2 restart prodeklarant
pm2 save
```

### 4. Lokalda ilova javob beradimi?

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002
```

`200` yoki `304` bo‘lishi kerak. Agar ulanish rad etilsa yoki javob bo‘lmasa — ilova 3002 da ishlamayapti; `pm2 logs prodeklarant` da xatolikni ko‘ring.

### 5. Ilovani qo‘lda ishga tushirib xatolikni ko‘rish

```bash
cd /var/www/prodeklarant.uz/server
node index.js
```

Terminalda xato chiqsa (masalan, `Error: Cannot find module 'better-sqlite3'` yoki `bind EADDRINUSE`), shu xatoni bartaraf eting. Keyin Ctrl+C bilan to‘xtatib, yana PM2 orqali ishga tushiring: `pm2 restart prodeklarant`.

### 6. Nginx ni qayta yuklash

Port va PM2 to‘g‘ri bo‘lsa ham Nginx cache tufayli 502 berishi mumkin:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7. better-sqlite3: "Could not locate the bindings file"

Agar logda `better_sqlite3.node` topilmayapti degan xato chiqsa — native modul Windows yoki boshqa mashinada o‘rnatilgan, server (Linux) da qayta compile qilinmagan. **server** papkasida `node_modules` ni o‘chirib, dependency’larni serverni ulab qayta o‘rnating:

```bash
cd /var/www/prodeklarant.uz/server
rm -rf node_modules
pnpm install
# agar serverda pnpm yo‘q bo‘lsa: npm install
```

Keyin PM2 ni qayta ishga tushiring:

```bash
cd /var/www/prodeklarant.uz
pm2 restart prodeklarant
pm2 save
```

Serverni yangilaganda (git pull) `node_modules` ni Windows’dan nusxalamang — har doim serverda `cd server && pnpm install` (yoki `npm install`) bajarilishi kerak, shunda better-sqlite3 Linux uchun compile bo‘ladi.

**Agar pnpm "Ignored build scripts: better-sqlite3" deb chiqarsa** — pnpm build skriptlarni ishga tushirmaydi. Ikki yo‘l:

1. **Bir martalik:** `server` papkasida `pnpm approve-builds` bajarib, ro‘yxatdan `better-sqlite3` ni tanlang; keyin `pnpm install` qayta ishlating (native modul compile bo‘ladi).
2. **Loyihada:** `server/package.json` da `"pnpm": { "onlyBuiltDependencies": ["better-sqlite3"] }` qo‘shilgan bo‘lsa, keyingi `pnpm install` da build avtomatik ruxsat etiladi. Kodni yangilab (git pull) qayta `pnpm install` bajarishingiz yetarli.

---

## Keyingi deploylar (kod yangilanganda)

Kodni yangilangach (git pull yoki fayllarni almashtirgach), serverda:

```bash
cd /var/www/prodeklarant.uz
./deploy/deploy.sh
```

Yoki Windows’dan: `deploy/deploy-from-local.ps1` ni o'zgaruvchilarni sozlab ishga tushiring — u SSH orqali shu buyruqni serverda bajaradi.

---

## Google indekslashi va "Sahifa indekslanmadi"

Agar Google Search Console da **"Страницы, которые не удалось проиндексировать"** / **"Sahifa indekslanmadi"** ko'rsatilsa, odatda quyidagilar sabab bo'ladi:

1. **SPA (bir HTML)** — Barcha URL bir xil `index.html` ni qaytaradi; kontent JavaScript orqali yuklanadi. Googlebot JS ni ishlatadi, lekin ba'zan sahifalarni **"Crawled - currently not indexed"** qilib qoldiradi (takroriy yoki past qiymat deb hisoblaydi).
2. **Sitemap yoki robots** — Agar `https://prodeklarant.uz/sitemap.xml` va `https://prodeklarant.uz/robots.txt` ochiq bo'lmasa, Google sahifalarni topishi qiyinlashadi.

**Loyihada qilingan yaxshilashlar:**
- `public/sitemap.xml` — asosiy sahifalar (/, /services, /about, /contact, /blog) sitemapda; build da `dist/` ga nusxalanadi. Server ishlaganda `/sitemap.xml` blog maqolalari bilan dinamik generatsiya qilinadi.
- `index.html` da path bo'yicha **title** va **description** dastlabki HTML da o'rnatiladi — krawler birinchi HTML da to'g'ri meta ko'radi.
- `robots.txt`: `Allow: /`, `Disallow: /admin`, `Sitemap: https://prodeklarant.uz/sitemap.xml`.

**Qilish kerak bo'lganlar:**
1. **Search Console** da: **URL Inspection** → muhim sahifa URL ni kiriting → **Request indexing** (Indekslashni so'rash).
2. **Sitemap** tekshirish: Search Console → Sitemaps → `https://prodeklarant.uz/sitemap.xml` qo'shing va yuboring; xatolik bo'lmasa, bir necha kun ichida sahifalar indeksga olinadi.
3. Agar ko'p sahifa **"Crawled - currently not indexed"** bo'lsa — bu SPA uchun odatiy; vaqt o'tishi bilan yoki muhim sahifalarni **Request indexing** qilish orqali yaxshilanadi. Kerak bo'lsa, kritik sahifalar uchun prerender (masalan prerender.io) yoki SSR ni keyinchalik qo'shish mumkin.
