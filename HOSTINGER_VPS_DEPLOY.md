# Hostinger VPS Deploy

This stack is prepared for a single Hostinger VPS using Docker:

- `frontend` serves the React app
- `backend` runs FastAPI
- `caddy` handles HTTPS and routes traffic by domain

## Domains

Point these DNS records to your VPS public IP:

- `A` record: `instaroadtax.my` -> your VPS IP
- `A` record: `www` -> your VPS IP
- `A` record: `api` -> your VPS IP

## Files added for deployment

- [docker-compose.yml](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/docker-compose.yml)
- [Caddyfile](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/Caddyfile)
- [backend/Dockerfile](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/backend/Dockerfile)
- [frontend/Dockerfile](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/frontend/Dockerfile)
- [backend/.env.production.example](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/backend/.env.production.example)

## Before deploy

1. Copy `backend/.env.production.example` to `backend/.env.production`
2. Fill in:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` after webhook setup
3. Keep `CORS_ORIGINS=https://instaroadtax.my,https://www.instaroadtax.my`

If you do not use MongoDB yet, you can leave:

- `MONGO_URL=mongodb://127.0.0.1:27017`
- `DB_NAME=instaroadtax`

The backend now falls back to local file storage automatically when MongoDB is unavailable.

## Deploy with Docker

From the repo root:

```bash
docker compose up -d --build
```

## What Caddy does

- `https://instaroadtax.my` -> frontend container
- `https://www.instaroadtax.my` -> frontend container
- `https://api.instaroadtax.my` -> backend container

Caddy will request Let's Encrypt certificates automatically once DNS is pointed correctly and ports `80` and `443` are open.

## Stripe

Set your Stripe webhook endpoint to:

`https://api.instaroadtax.my/api/payments/webhook`

Then paste the webhook signing secret into:

- `STRIPE_WEBHOOK_SECRET`

## Firewall / ports

Open these on the VPS:

- `80`
- `443`

You do not need to expose backend port `8000` publicly.
