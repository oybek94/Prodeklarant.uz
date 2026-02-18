# Prodeklarant Blog API

## O'rnatish

```bash
cd server
npm install
```

## Sozlash

`.env.example` dan `.env` faylini nusxalang va qiymatlarni o'zgartiring:

- `ADMIN_PASSWORD` — admin panel paroli (default: admin123)
- `JWT_SECRET` — JWT kalit
- `PORT` — server porti (default: 3001)

## Ishga tushirish

```bash
npm run dev
```

Server `http://localhost:3001` da ishga tushadi.

## Frontend bilan ishlatish

1. Terminal 1: `npm run dev:server` (server)
2. Terminal 2: `npm run dev` (Vite frontend)

Vite `/api` so'rovlarini `http://localhost:3001` ga proxy qiladi.
