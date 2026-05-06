# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

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
