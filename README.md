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
4. Create an editor login: **Authentication → Users → Add user** (email + password). Keep public signup off.
5. Open **`/admin`** on the site to edit content. Table Editor still works as a fallback.
6. Brevo (optional): in `/admin/kontakt` set API key, senders, list IDs, and **Javni URL stranice** (`https://lincarnica.hr`).

## Admin (`/admin`)

1. Run the latest SQL (`schema.sql` or new files in `supabase/migrations/`).
2. **Authentication → Users → Add user** (email + password).
3. Visit `https://your-domain/admin` and sign in.
4. For email: deploy Edge Functions (GitHub Actions or CLI), then fill **Brevo** in `/admin/kontakt`. No extra env vars needed.

Kinds for obavijesti: Obavijest, Sastanak, Događaj, Fešta. Past dated items stay visible but grey on the public site.

Public visitors can subscribe with the bell icon on Obavijesti. Publishing a notice from admin emails active subscribers (with unsubscribe link).

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
| `title` / `body` | Title + full text (list preview; tap opens detail sheet) |
| `kind` | `obavijest` / `sastanak` / `dogadaj` / `festa` |
| `emoji` | Optional emoji/icon (e.g. 🎉) |
| `happens_at` | Optional date (past dates stay visible but grey). Time is optional; shown on the site only when set. |
| `important` | *Važno* badge (current items) |
| `draft` | `false` = published |

### `obavijesti_pretplatnici`

Email subscriptions (`active`, unsubscribe `token`). Managed in `/admin/pretplate`.

### `brevo_settings` (single row `id = 1`, admin-only)

`api_key`, `sender_kontakt`, `sender_obavijesti`, `recipient_kontakt`, `list_id_kontakt`, `list_id_obavijesti`, `site_url`.

### `kontakt_settings` (single row `id = 1`)

Headings, labels, email/phone/address, success/error text (public-safe fields only on the site).

### `kontakt_poruke`

Incoming form messages (insert from the public site).

## Optional GitHub secrets (auto sync)

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Build-time frontend |
| `VITE_SUPABASE_ANON_KEY` | Build-time frontend |
| `SUPABASE_ACCESS_TOKEN` | [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project Settings → General → Reference ID |

Brevo is configured only in `/admin/kontakt` — not in GitHub secrets.

## Deploy (Hostinger)

If Hostinger builds from Git, set only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (prefer publishable key)

Then push to the connected branch. Enable SPA fallback so `/admin` works (Hostinger Node/Vite apps usually do; `.htaccess` is included for Apache). Do **not** put `SUPABASE_ACCESS_TOKEN` or `SUPABASE_PROJECT_REF` on Hostinger.

Alternatively: set those two in local `.env`, run `npm run build`, upload **`dist/`**.

You still need to run [`supabase/schema.sql`](./supabase/schema.sql) once in the Supabase SQL editor (unless GitHub Actions secrets for auto `db push` are configured).

No VPS required.

## Version

- Source of truth: `package.json` → `"version"` (currently **0.8.0**).
- History: [`CHANGELOG.md`](./CHANGELOG.md).
- On release: bump version, update changelog, then lint/build.
