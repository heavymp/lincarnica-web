# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [0.7.0] — 2026-08-24

### Added

- Brevo **API key** editable in `/admin/kontakt` (stored in private `brevo_settings`, not public).
- Separate Brevo **Sender** addresses for Kontakt vs Obavijesti, plus Kontakt recipient (To).

### Changed

- Public site no longer loads Brevo credentials from `kontakt_settings`.

## [0.6.1] — 2026-08-24

### Changed

- Admin Brevo section: clearer layout and Brevo nomenclature (Sender email, List ID, Transactional / Contacts).

## [0.6.0] — 2026-08-24

### Added

- **Pretplata na obavijesti**: bell icon on the public list, Brevo email on publish, admin subscriber list, and `/odjava` unsubscribe links in emails.

### Changed

- Notice cards no longer show “Otvori / Pročitaj više” text (still fully clickable).

## [0.5.0] — 2026-08-24

### Added

- Tap/click an **Obavijest** to open a polished detail sheet with the full description (list shows a short preview).

## [0.4.2] — 2026-08-24

### Changed

- Obavijesti show **time** on the public site only when it is set in `/admin`; date-only notices stay date-only.

## [0.4.1] — 2026-08-24

### Changed

- Obavijest kind label **Festa** → **Fešta**.

## [0.4.0] — 2026-08-24

### Added

- Apple-like **`/admin`** editor (login, Obavijesti, site copy, Kontakt, messages).
- Notice **kinds** (obavijest, sastanak, događaj, festa), emoji picker, and date/time controls.
- Authenticated write policies so the editor can talk to Supabase without the Table Editor.

## [0.3.0] — 2026-08-24

### Added

- **Kontakt** pill with contact form; settings and messages live in Supabase; optional **Brevo** via Edge Function.
- CMS tables: `site_content` (hero/footer/labels/meta), `kontakt_settings`, `kontakt_poruke`.
- Obavijesti `emoji` field; scrollable list with past items greyed and scrolled above the current event.
- CI job to `db push` + deploy `kontakt` function when Supabase secrets are set.

### Changed

- Obavijesti opens by default.
- All main page copy is loaded from Supabase (with local fallbacks).

## [0.2.0] — 2026-08-24

### Changed

- Obavijesti now use **Supabase** (free hosted) instead of self-hosted PocketBase, so the site stays deployable on static hosts like Hostinger.

### Removed

- PocketBase scripts, Docker Compose, and local `pb_migrations`.

## [0.1.0] — 2026-08-24

### Added

- **Obavijesti** panel on the landing page, opened from a pill (no traditional menu).
- Section registry (`src/sections/registry.js`) so a later panel like Kontakt can share the same dock.

### Changed

- Coming-soon heading replaced with a short welcome; footer now says the site keeps evolving.
- Meta description updated to match the live landing.

## [0.0.3] — 2026-05-06

### Added

- **GitHub Actions** workflow (`.github/workflows/ci.yml`): on **`main`** pushes and PRs — **`npm ci`**, **`npm run lint`**, **`npm run build`**.
- **`engines.node`** (`>=20`) in **`package.json`** as a documented baseline.

## [0.0.2] — 2026-05-06

### Added

- **`repository`** in **`package.json`**; footer **version** links to **`CHANGELOG.md`** on GitHub (opens in a new tab).

### Removed

- **`scripts/github-sync.sh`** and **`npm run github:*`** helpers; GitHub CLI instructions removed from **`README.md`** (use normal **`git push`**).

---

## [0.0.1] — 2026-05-06

First tracked release: static “uskoro stižemo” landing page only (`0.x` until the site grows beyond this phase).

### Added

- React + Vite landing (“uskoro stižemo”), Croatian (`lang="hr"`), association branding and logo.
- ESLint (React, Hooks, Refresh) and production build (`vite build` → `dist/`).
- Meta tags (description, theme color, Open Graph, Twitter card) and Google Fonts (Outfit, Playfair Display).
- **`README.md`** and this changelog; version read from **`package.json`** at build time (`__APP_VERSION__`) and shown in the footer (`v0.0.x`).

<!-- When the repo URL is set, add Keep a Changelog footer links for Unreleased + each tag. -->
