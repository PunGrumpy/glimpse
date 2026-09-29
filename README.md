```
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣄⠀⠀⠀⢿⣿⠀⠀⠀⣠⡀⠀⠀⠀             View public Instagram without an account.
⠀⠀⠀⠈⢿⣧⠀⠀⠘⠃⠀⠀⣼⡿⠁⠀⠀⠀
⠀⢀⣀⠀⠀⠈⣠⣴⣶⣶⣦⣄⠀⠀⠀⢀⣀⠀             pnpm install && pnpm dev
⠀⠙⠛⠓⠀⣾⣿⣿⣿⣿⣿⣿⣷⡀⠚⠛⠋⠀
⠀⠀⠀⠀⢘⣉⣥⣤⣤⣤⣤⣬⣉⡃⠀⠀⠀⠀             ⚠ Status: Experimental. Unofficial; not affiliated with Instagram or Meta.
⠀⠀⠀⢶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⠄⠀⠀
⠀⠀⠀⠀⠉⠛⠻⠿⠿⠿⠿⠿⠛⠉⠀⠀⠀⠀
```

Glimpse is a Next.js app for browsing public Instagram profiles, posts, reels, stories and highlights without an Instagram account. Paste a username or a post link, and Glimpse reads Instagram’s logged‑out API and renders a page you can browse and download from. It stores nothing you view.

## What you can view

- **No account:** profiles, posts, reels and highlight covers work with zero configuration
- **Same URLs as Instagram:** swap the domain, so `instagram.com/p/DW1nTDiDvnF` becomes `/p/DW1nTDiDvnF`
- **Stories and private accounts:** a server `sessionid` unlocks stories for everyone; visitors can connect their own to see private accounts they follow
- **Downloads:** every photo and video saves at full resolution

## Get started

Glimpse needs Node.js 20.9+ and pnpm 12:

```bash
git clone https://github.com/PunGrumpy/glimpse.git
cd glimpse
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) and search for `@nasa`, or paste an instagram.com post or reel link.

## Configure environment variables

Copy `.env.example` to `.env.local` and set what you need:

| Variable | Use |
| --- | --- |
| `IG_PROVIDER` | `web` (default) reads Instagram; `mock` serves fake data for UI work |
| `IG_SESSION_ID` | `sessionid` of a secondary account; enables stories for every visitor |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for absolute Open Graph image links |

## Deploy to Cloudflare Workers

Glimpse deploys through [OpenNext](https://opennext.js.org/cloudflare). Try it in the Workers runtime first, then deploy:

```bash
pnpm run preview
pnpm run deploy
```

For Workers Builds, use `pnpm exec opennextjs-cloudflare build` as the build command. Instagram rate‑limits Cloudflare’s shared IP addresses, so on Workers, profiles often show “Instagram needs a breather” while single posts and reels still load.

## Develop Glimpse

`pnpm check` lints and checks formatting with [Ultracite](https://www.ultracite.ai), `pnpm fix` applies fixes, and a husky hook runs it on commit. Instagram changes its GraphQL query IDs without notice; the current ones are constants at the top of `lib/instagram/providers/web.ts`. See [AGENTS.md](AGENTS.md) for the code standards.

## Use at your own risk

Glimpse uses unofficial Instagram endpoints that can change at any time, and automated access is against Instagram’s terms. Treat it as a personal or experimental project, and use secondary accounts for any `sessionid`.
