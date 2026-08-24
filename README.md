# Linčarnica web

React + Vite site for **Udruga mještana Ugljan – Sušica „Linčarnica”**.

Static files go on Hostinger (or any static host). Copy, Obavijesti, and Kontakt are edited in **Supabase**. Contact form messages are stored in Supabase and can be forwarded to **Brevo**.

## Requirements

- **Node.js** (LTS) and **npm**.
- A free [Supabase](https://supabase.com) project.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000). |
| `npm run build` | Output to `dist/`. |
| `npm run preview` | Preview `dist/` locally. |
| `npm run lint` | ESLint. |

## GitHub + Supabase (do you need to connect them?)

**No.** Creating a Supabase project does **not** require connecting GitHub.

What *is* optional and useful:

1. Put this website repo on GitHub (you already can).
2. In GitHub → Settings → Secrets, add the keys below.
3. On every push to **`main`**, CI can **apply DB migrations** and **deploy the Kontakt Edge Function** automatically.

That is *not* the same as “Connect GitHub” inside the Supabase dashboard. You do not need that switch.

Uploading `dist/` to Hostinger alone does **not** update the database. Schema updates happen when SQL migrations run (SQL editor once, or GitHub Actions on `main`).

## First-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (no GitHub link needed).
2. **SQL** → New query → paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. **Project Settings → API Keys** → copy **Project URL** and **Publishable** key (`sb_publishable_…`; legacy anon also works) into Hostinger env / `.env` as:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Edit content in the Table Editor (see tables below).
5. Optional Brevo: create an API key + list ID, set `brevo_list_id` / `notify_email` in `kontakt_settings`, then store `BREVO_API_KEY` as a Supabase secret (or as a GitHub secret so CI sets it).

## Editable tables

### `site_content` (hero, footer, labels)

| key | Meaning |
|-----|---------|
| `hero_title` | Main heading |
| `hero_subtitle` | Text under the heading |
| `footer_text` | Footer line |
| `logo_alt` | Logo alt text |
| `meta_title` / `meta_description` | Browser / SEO |
| `label_obavijesti` / `label_kontakt` | Pill labels |

Seeds are inserted only if missing — migrations **do not overwrite** your edits.

### `obavijesti`

| Column | Meaning |
|--------|---------|
| `title` / `body` | Content |
| `emoji` | Optional emoji/icon (e.g. 🎉) |
| `happens_at` | Event date — past dates stay visible but greyed out |
| `important` | *Važno* badge (current items) |
| `draft` | `false` = published |

### `kontakt_settings` (single row `id = 1`)

Headings, labels, email/phone/address, success/error text, `brevo_list_id`, `notify_email`.

### `kontakt_poruke`

Incoming form messages (insert from the public site).

## Optional GitHub secrets (auto sync)

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Build-time frontend |
| `VITE_SUPABASE_ANON_KEY` | Build-time frontend |
| `SUPABASE_ACCESS_TOKEN` | [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project Settings → General → Reference ID |
| `BREVO_API_KEY` | Optional; CI stores it as a Supabase function secret |

## Deploy (Hostinger)

If Hostinger builds from Git, set only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (prefer publishable key)

Then push to the connected branch. Do **not** put `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, or `BREVO_API_KEY` on Hostinger.

Alternatively: set those two in local `.env`, run `npm run build`, upload **`dist/`**.

You still need to run [`supabase/schema.sql`](./supabase/schema.sql) once in the Supabase SQL editor (unless GitHub Actions secrets for auto `db push` are configured).

No VPS required.

## Version

- Source of truth: `package.json` → `"version"` (currently **0.3.0**).
- History: [`CHANGELOG.md`](./CHANGELOG.md).
- On release: bump version, update changelog, then lint/build.
