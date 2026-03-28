# Deployment

Recommended production setup:

- Frontend on Vercel at `https://instaroadtax.my`
- Backend on Render at `https://api.instaroadtax.my`

Why this split:

- Vercel handles the root domain and `www` cleanly for the React frontend.
- Render runs the FastAPI backend well and supports custom domains.
- Render's docs currently say Hobby workspaces support only two custom domains across all services, so using Render for both frontend and backend can get tight if you want root, `www`, and `api` together.

## 1. Push this repo

Push the latest code to the GitHub repo that both platforms can read.

## 2. Deploy the frontend on Vercel

Use the `frontend` directory as the project root.

- Framework: Create React App
- Build command: `npm run build`
- Output directory: `build`

Domain:

- Add `instaroadtax.my` in Vercel project domain settings.
- Add `www.instaroadtax.my` if you want the redirect as well.

Per Vercel's official custom domain docs, apex domains typically use an `A` record and subdomains use a `CNAME`, but use the exact DNS values Vercel shows for your project when you add the domain.

## 3. Deploy the backend on Render

This repo now includes [render.yaml](/abs/path/c:/Users/User/Desktop/CODEX/instaroadtax/render.yaml) for the API service.

Create the Render web service from the repo root and let Render sync from `render.yaml`.

Important:

- The blueprint is set to `starter` because Render's official docs say free web services spin down on idle and cannot use persistent disks, which would break uploads and local file persistence in production.
- Region is set to `singapore` for lower latency to Malaysia.

Add the custom domain:

- `api.instaroadtax.my`

Render will then show the DNS record you need to add at your registrar for that subdomain.

## 4. Set backend environment variables in Render

Provide these values in the Render dashboard:

- `MONGO_URL`
- `DB_NAME`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CORS_ORIGINS=https://instaroadtax.my,https://www.instaroadtax.my`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The blueprint already sets persistent file paths:

- `STORAGE_DIR=/var/data`
- `STORAGE_FILE=/var/data/local_storage.json`
- `UPLOAD_DIR=/var/data/uploads`

## 5. Finish Stripe

In Stripe Dashboard:

- Add a webhook endpoint at `https://api.instaroadtax.my/api/payments/webhook`
- Copy the webhook signing secret into Render as `STRIPE_WEBHOOK_SECRET`

## Official docs used

- Vercel custom domains: https://vercel.com/kb/guide/how-do-i-add-a-custom-domain-to-my-vercel-project
- Render Blueprints: https://render.com/docs/infrastructure-as-code
- Render Blueprint spec: https://render.com/docs/blueprint-spec
- Render static sites: https://render.com/docs/static-sites
- Render pricing: https://render.com/pricing/
