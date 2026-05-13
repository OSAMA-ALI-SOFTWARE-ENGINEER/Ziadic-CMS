# Hostinger Deployment

This repo has two Vite/Vue apps:

- `frontend` builds to `frontend/dist` and should be served from the domain root.
- `admin` builds to `admin/dist` and should be served from `/admin/`.

The production files are static HTML, CSS, JS, images, and fonts. Node.js is needed only during the build step in GitHub Actions. The Hostinger site itself can run on the normal PHP/Laravel hosting setup unless the backend project uses Node SSR or a separate Node API.

## GitHub Secrets

Add these in GitHub under `Settings > Secrets and variables > Actions > Repository secrets`:

- `HOSTINGER_FTP_SERVER`
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`

Optional repository variables:

- `HOSTINGER_FRONTEND_DIR`, default: `public_html/`
- `HOSTINGER_ADMIN_DIR`, default: `public_html/admin/`

## Workflow

On every push to `main`, `.github/workflows/hostinger-deploy.yml` will:

1. Install dependencies for `frontend` and `admin`.
2. Build both apps.
3. Upload `frontend/dist/` to the domain root.
4. Upload `admin/dist/` to `/admin/`.

## Hostinger Setup

Use PHP/Laravel hosting for the backend. Point the domain document root to Laravel's `public` folder if the Laravel backend is in this same hosting account.

For this current repo, there is no Laravel app committed at the root, so the workflow deploys the frontend build as static files. If you later add the Laravel backend to this repo, the deployment should be adjusted so Laravel files are uploaded outside `public_html` and only Laravel's `public` folder is exposed.
