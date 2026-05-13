# Zaidic Frontend

The `frontend` app is the public website for Zaidic. It is built with Vue 3, TypeScript, Vite, Tailwind CSS, PrimeVue, Pinia, and Vue Router.

This app currently combines new Vue pages with migrated legacy Webflow pages. The Vue router controls the user-facing routes, while selected legacy HTML files are loaded through `LegacyRoutePage.vue` so older static pages can keep working during the migration.

## Tech Stack

- Vue 3 with `<script setup>`
- TypeScript
- Vite
- Tailwind CSS via `@tailwindcss/vite`
- Vue Router for public routes
- Pinia for state management
- PrimeVue and PrimeIcons for UI components/icons
- GSAP and jQuery for legacy/interactive assets

## Requirements

- Node.js 24 recommended, matching the GitHub Actions deployment workflow
- npm

## Installation

```bash
npm install
```

For CI and deployment, use:

```bash
npm ci
```

## Development

Start the local Vite dev server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The build output is generated in:

```text
frontend/dist/
```

`dist/` is ignored by git because GitHub Actions rebuilds it during deployment.

## Project Structure

```text
frontend/
  index.html                Vite HTML entry point
  package.json              npm scripts and dependencies
  package-lock.json         Locked dependency versions
  vite.config.ts            Vite, Vue, Tailwind, and alias config
  tailwind.config.ts        Tailwind theme/content config
  tsconfig*.json            TypeScript configuration
  public/
    .htaccess               Apache fallback for Vue history routing
    favicon.svg             Site favicon
    icons.svg               Shared icon sprite
    css/                    Legacy Webflow CSS
    js/                     Legacy Webflow/jQuery scripts
    fonts/                  FontAwesome legacy fonts
    images/                 Legacy public image assets
    assets/                 Legacy duplicated asset paths used by HTML/CSS
    documents/              Static document/animation assets
    legacy/                 Migrated Webflow HTML pages loaded by Vue routes
  src/
    main.ts                 Vue app bootstrap
    App.vue                 Root Vue component
    style.css               Global app styles
    assets/                 Source-controlled Vue assets
    layouts/
      PublicLayout.vue      Public website shell
    components/
      legacy/
        LegacyWebflowPage.vue  Loads legacy static HTML into Vue routes
      organisms/
        SiteHeader.vue      Public header/navigation
        SiteFooter.vue      Public footer
    pages/
      HomePage.vue          Homepage route
      AboutPage.vue         About route
      LegacyRoutePage.vue   Wrapper for legacy route content
    router/
      index.ts              Route definitions and page titles
```

## Routing

The app uses `createWebHistory()`, so the server must rewrite unknown frontend paths back to `index.html`. The `public/.htaccess` file is copied into `dist/.htaccess` during builds for Apache/Hostinger hosting.

Main Vue routes:

- `/`
- `/about`

Legacy-backed routes:

- `/listings`
- `/listings/:slug`
- `/blogs`
- `/blogs/:slug`
- `/cities`
- `/cities/:slug`
- `/city-categories/:slug`
- `/team/:slug`
- `/contact`
- `/pricing`
- `/services`
- `/add-listing`
- `/search`

## Legacy Webflow Pages

The `public/legacy/` folder stores HTML exported from the earlier Webflow/static site. Those files are not compiled by Vue, but they are copied into the final Vite build and loaded by `LegacyWebflowPage.vue`.

Keep these asset rules in mind when editing legacy pages:

- Files inside `public/` are served from the site root.
- Legacy pages should reference root-safe paths such as `/images/...`, `/assets/images/...`, `/css/...`, and `/js/...`.
- Do not import legacy HTML directly into Vue components unless the page is being fully migrated.

## Deployment

The repository-level GitHub Actions workflow builds this frontend on every push to `main` and uploads `frontend/dist/` to Hostinger.

Hostinger does not need to run this frontend as a Node.js app. Node.js is only needed during the build step. The generated output is static HTML, CSS, JavaScript, fonts, and images, so it can be served by normal PHP/Laravel hosting.

If the Laravel backend is deployed on the same Hostinger account, keep Laravel's document root pointed at Laravel's `public` directory and place the compiled frontend assets according to the hosting/domain setup.

## Notes for Future Changes

- Add new Vue-native pages under `src/pages/` and register them in `src/router/index.ts`.
- Keep shared public layout work in `src/layouts/PublicLayout.vue`.
- Migrate legacy pages gradually from `public/legacy/` into Vue components when they need dynamic behavior.
- Re-run `npm run build` before deployment-related changes to catch TypeScript and Vite errors early.
