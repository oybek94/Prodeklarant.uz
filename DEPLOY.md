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

## Keyingi deploylar (kod yangilanganda)

Kodni yangilangach (git pull yoki fayllarni almashtirgach), serverda:

```bash
cd /var/www/prodeklarant.uz
./deploy/deploy.sh
```

Yoki Windows’dan: `deploy/deploy-from-local.ps1` ni o'zgaruvchilarni sozlab ishga tushiring — u SSH orqali shu buyruqni serverda bajaradi.
