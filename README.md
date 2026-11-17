# Tweet2Share

Turn public X (Twitter) posts into readable, shareable PNG images.

Live site: https://ok406lhq.github.io/Tweet2Share/

[中文说明](README.zh.md)

## What it does

Paste a public post link. Tweet2Share keeps the original text, author, and image order, lays them out as a share card, and exports a PNG.

Flow: copy a link → import → choose a layout → export.

## Features

- Accepts `x.com`, `twitter.com`, common public mirrors, and raw tweet IDs
- Keeps the body, display name, handle, avatar, and verification mark, including line breaks
- Loads photos in original order, preferring `name=orig` full-size images
- Nested quoted tweets
- Long PNG export, or pages around 2000px tall
- Chinese / English UI switch (Chinese by default on the site)
- Credit `anomo` in the top-right of the site and the bottom-right of exported images

## Stack

- Frontend: Vite + vanilla JavaScript, canvas export
- Backend: Express (local development only)
- Tweet source: public [FxTwitter API](https://docs.fxembed.com/api/twitter/operations/2statusid/)
- Local images go through a same-origin proxy so canvas export can read them

## GitHub Pages

Repository: https://github.com/ok406lhq/Tweet2Share

Pages hosts the static frontend only. Pushing `main` builds `frontend/` with Actions. Set Pages Source to GitHub Actions the first time (Settings → Pages).

On Pages there is no backend. The browser talks to FxTwitter directly, and tweet images are loaded through a CORS-friendly image proxy for export.

## Run locally

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start both services from the repo root
cd ..
bash start.sh
```

Frontend: `http://localhost:5173`. Backend: `http://localhost:3001`. Vite proxies `/api` to the backend in development.

```bash
# Backend unit tests
npm --prefix backend test
```

## Notes

- Only public posts you have the right to use
- Follow X (Twitter) terms of service
- Keep original author credit before saving or sharing
- Private, deleted, or unavailable posts cannot be parsed
