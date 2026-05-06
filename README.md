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
