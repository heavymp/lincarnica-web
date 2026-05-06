# Linčarnica web

Static React + Vite “uskoro stižemo” page for **Udruga mještana Ugljan – Sušica „Linčarnica”**.

## Requirements

- **Node.js** (LTS) and **npm**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000). |
| `npm run build` | Output to `dist/`. |
| `npm run preview` | Preview `dist/` locally. |
| `npm run lint` | ESLint. |

## Version

- **Source of truth:** `package.json` → `"version"` (JSON, SemVer `0.x` while this is the landing-only phase).
- **History:** [`CHANGELOG.md`](./CHANGELOG.md).
- **On release:** bump `"version"`, add a section to `CHANGELOG.md`, then `npm run lint` and `npm run build`. The site footer shows the same version (`vX.Y.Z`).

## Deploy

`npm run build` → host the **`dist/`** folder on your static host or CDN.

## GitHub push (from this machine)

GitHub CLI is expected at **`~/.local/bin/gh`** (install once if missing — see [cli/cli releases](https://github.com/cli/cli/releases)). Put it on your PATH, e.g. add to `~/.bashrc`:

`export PATH="$HOME/.local/bin:$PATH"`

**One-time:** sign in, then let `gh` handle Git HTTPS credentials:

1. `npm run github:login`  
2. `npm run github:setup-git`

**Create the repo and push `main`** (uses `package.json` `name` as the repo name, or links if it already exists):

`npm run github:push`

Non-interactive / CI: `echo YOUR_PAT | gh auth login --with-token -h github.com` (token needs `repo` scope).
