# Tweet2Share

Turn public X (Twitter) and Weibo posts into readable, shareable PNG images.

Live site: https://ok406lhq.github.io/Tweet2Share/

[中文说明](README.zh.md)

## What it does

Paste a public post link from X or Weibo. Tweet2Share keeps the original text, author, and image order, lays them out as a share card, and exports a PNG.

Flow: copy a link → import → choose a layout → export.

## Features

- Accepts `x.com`, `twitter.com`, common public mirrors, raw tweet IDs, and public Weibo links (`weibo.com`, `m.weibo.cn`, Weibo bids)
- Keeps the body, display name, handle, avatar, and verification mark, including line breaks
- Loads still photos in original order, preferring `name=orig` full-size images; GIFs and videos are omitted
- Nested quoted tweets and Weibo reposts
- Optional comments under the post, ranked by relevance, with a count slider; ad-like replies are skipped
- Long PNG export, or pages around 2000px tall
- Chinese / English UI switch (Chinese by default on the site)
- Credit `anomo` in the top-right of the site and the bottom-right of exported images

## Stack

- Frontend: Vite + vanilla JavaScript, canvas export
- Backend: Express (local development only)
- Tweet source: public [FxTwitter API](https://docs.fxembed.com/api/twitter/operations/2statusid/)
- Weibo source: public `m.weibo.cn` status, extend, and hot-comment APIs
- Local images go through a same-origin proxy so canvas export can read them

## GitHub Pages

Repository: https://github.com/ok406lhq/Tweet2Share

Pages hosts the static frontend only. Pushing `main` builds `frontend/` with Actions. Set Pages Source to GitHub Actions the first time (Settings → Pages).

On Pages there is no backend. The browser talks to FxTwitter directly, and X images are loaded through a CORS-friendly image proxy for export.

Weibo JSON has no CORS and only returns data with `X-Requested-With: XMLHttpRequest`. Public CORS proxies drop that header.

To enable Weibo on Pages:

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and log in.
2. From the repo root: `npx wrangler deploy --config worker/wrangler.toml`
3. Copy the Worker URL (for example `https://tweet2share-weibo.<account>.workers.dev`).
4. In the GitHub repo: Settings → Secrets and variables → Actions → Variables → `VITE_WEIBO_PROXY` = that URL.
5. Re-run the Pages workflow.

Without that variable, use the local backend (`bash start.sh`).

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
- Follow X (Twitter) and Weibo terms of service
- Keep original author credit before saving or sharing
- Private, deleted, or unavailable posts cannot be parsed
