# Evermissed — Project Context (PRD Summary)

This repository implements the **Digital Memorial & Obituary Platform** described in the PRD (humans + pets).

## Product goals
- Create respectful, enduring memorial pages for **humans** and **pets**
- Provide a public **directory + search**
- Enable visitors to leave condolences and purchase **virtual tributes**
- Monetize via **store items**, **premium upgrades**, and **ads**

## Roles (PRD)
- **Guest (unregistered)**: can search directory, view **public** memorials, leave text condolences, and purchase virtual tributes.
- **Registered User**: creates/owns memorials; can edit content, upload media, set visibility (public/unlisted/password), and moderate guestbook + tributes on **their** memorial.
- **B2B Partner** (funeral home / pet crematorium): upgraded registered user on subscription; can create/manage **bulk** memorials for clients.
- **Super Admin** (site owner): full CMS; manage users, global moderation, store items, ads/settings, and platform controls.

## Non-negotiables (critical PRD requirements)
- **Roles & permissions**: enforce Guest / Registered / B2B / Super Admin with distinct capabilities; owner-moderation on their memorial; admin global override.
- **Privacy**: memorial visibility must support **public / unlisted / password-protected** with correct behavior:
  - public: directory + Google index
  - unlisted: not in directory + not indexed; accessible by direct link/QR
  - password-protected: requires PIN/password to view and leave tributes
- **Draft mode**: memorial creation must support draft saving and later publishing.
- **Humans vs Pets**: separate directory routes and UI for both categories.
- **Directory search**: advanced filtering (name, location, birth/death years, tags), pagination, sorting (recently added/updated, alphabetical).
- **Guestbook + tributes**: free text condolences; purchasable virtual items; premium/animated options (e.g., highlighted candle for 30 days).
- **Payments**: Stripe checkout for virtual items (secure checkout, SSL).
- **Admin CMS**: store item CRUD (asset upload, price, category, active flag), global moderation queue, profanity filter, ad slots/settings and global ads toggle, revenue dashboard, multiple plans.
- **Email**: transactional system emails (verification/reset), receipts for purchasers, notifications for owners and renewals for B2B.
- **UX**: mobile-first, calm tone, WCAG-friendly, fast loads; uploaded images must be compressed.
- **Compliance/Security**: SSL everywhere (especially checkout), GDPR/CCPA privacy + account deletion; admin tools include takedown and IP ban.

## Core feature requirements (high level)
- **Draft mode** for memorial creation
- **Directory** split: Humans vs Pets, with filtering (name, location, birth/death years, tags), pagination & sorting
- **Memorial page**:
  - privacy controls (**public / unlisted / password-protected**)
    - **public**: in directory + indexable by Google
    - **unlisted**: hidden from directory + search engines; accessible via direct link/QR
    - **password-protected**: requires PIN/password to view + leave tribute
  - rich content, gallery, video embeds (YouTube/Vimeo)
  - QR code generator (downloadable)
  - SEO/OG tags: dynamic OG image/name/dates; one-click share (FB/WhatsApp/email)
  - ad slots (AdSense) toggleable by Admin; disable ads on premium pages
- **Guestbook**: free text condolences + moderation
- **Virtual tributes**: microtransactions, tiered items (static/animated), premium highlight duration
- **Payments**: Stripe (chosen) for checkout
- **Admin CMS**:
  - CRUD store items (SVG/PNG, price, category, active/inactive)
  - global moderation queue (reported memorials/comments), profanity filter, and admin override (take down memorial, delete comment, ban IP)
  - ad slots + platform settings (global AdSense snippets + global ads on/off)
  - basic revenue reporting (sales + premium upgrades) and support for multiple plans
- **Emails/notifications**:
  - users: new tribute purchased + guestbook entry pending approval
  - guests/purchasers: e-commerce receipts
  - system: password resets, account verification, subscription renewals
- **UI/UX**: mobile-first, calm/muted palette, high accessibility (WCAG); compress uploads for performance
- **Compliance/Security**: SSL required (especially checkout); GDPR/CCPA privacy + account deletion

## Tech stack (current decisions)
- **Next.js 14 (App Router) + TypeScript (strict) + Tailwind**
- **Supabase**: Auth, Postgres, RLS, Storage (to be configured), plus server-side operations when needed
- **Stripe**: payments (PayPal not planned)

## Security & access control principles
- Use **RLS** for all tables.
- Guests must not be able to write “paid” records directly. Guest purchases should be finalized via **server/webhook**.
- Users must never be able to self-promote roles.

## Current DB (as created via SQL Editor)
Tables exist for: `profiles`, `memorials`, `memorial_media`, `guestbook_entries`, `store_items`, `orders`, `virtual_tributes`, `b2b_subscriptions`, `qr_codes`, `ad_slots`, `platform_settings`, `content_reports`.

## Super-admin takedown & IP bans (implemented)
- **Migration**: `supabase/migrations/20260327_ip_bans_and_memorials_admin_select.sql` — table `ip_bans` (cidr, reason, expires_at), RLS admin-only CRUD; RPC `is_ip_address_banned(check_ip text)` granted to `anon` for middleware; policy **`memorials_select_admin_all`** so admins can list all memorials for CMS search.
- **Admin → Memorials** (`/admin/memorials`): search by name/slug, paginated list, **Delete memorial** (permanent).
- **Admin → IP bans** (`/admin/ip-bans`): add IPv4/IPv6 or CIDR, optional expiry; remove ban. **Middleware** calls `is_ip_address_banned` on every matched request; **server checks** also on tribute create, content report, memorial create, Stripe checkout, B2B checkout, password verify API.
- **Exemptions**: users with **`profiles.role = admin`** (session valid) skip IP ban everywhere. Optional env **`IP_BAN_EXEMPT_IPS`** (comma-separated) for trusted IPs without logging in (recovery).

## Content reports (user flags — implemented)
- **Migration**: `supabase/migrations/20260326_content_reports.sql` — enum reasons/status, RLS (anyone **INSERT**, admin **SELECT/UPDATE/DELETE**).
- **Memorial page**: “Report this page” under the header; per–guestbook entry **Report** on published free/paid rows. Server action `submitContentReportAction` validates tribute ↔ memorial, optional EN profanity on reporter note, password-gate via `assertPasswordMemorialInteractionAllowed` (same as guestbook).
- **Admin → Reports** (`/admin/reports`): queue sorted with **open** first; actions — dismiss, mark reviewed, email owner (`contentReportOwnerEmail` + Resend), remove guestbook entry (`deleteTributeAction`), remove entire memorial (double-click confirm; cascades).

## Directory: years & tags (PRD advanced search)
- Migration `supabase/migrations/20260318120000_memorial_tags_and_year_columns.sql`: `tags text[]` (GIN index), generated `birth_year` / `death_year` from date columns, B-tree indexes for range filters. Run in Supabase SQL Editor.
- `/memorials/humans` and `/memorials/pets`: filter by birth/death year ranges + tag overlap (comma-separated in UI; memorials match if they share **any** listed tag). Memorial create/edit form includes optional tags field.

## Profanity filter (PRD — EN, hard block)
- **`blocked_words`** table: `word` (single word or phrase), `is_active`. Public **SELECT** (for server checks with anon/guest); **write** = admin only.
- **One-shot SQL (schema + RLS + EN seed list)**: `supabase/sql/blocked_words_complete.sql` — run in SQL Editor for a full setup.
- **Migration only (empty table)**: `supabase/migrations/20260325_blocked_words.sql`.
- **Applied in**: guestbook message + guest name (`createTributeAction`); optional paid-tribute checkout message (`/api/stripe/checkout`). **Not** on memorial story/title (avoid false positives).
- **Behavior**: block with user message, **do not save**. Add terms via SQL (future: admin UI + `invalidateBlockedWordsCache`).

## Store items — CMS (PRD 4.1)
- **Admin → Store**: full CRUD for `store_items` including **Delete** (blocked if any `virtual_tributes` reference the item).
- **Images**: upload **SVG / PNG / JPEG / WebP** (max 2MB) to Supabase Storage bucket **`store-items`**, or paste an external **image URL**.
- **Migration**: `supabase/migrations/20260324_storage_store_items_bucket.sql` creates the public bucket and storage policies (admin write, public read). Apply in SQL Editor if uploads fail with “bucket not found”.

## Virtual tributes & guestbook (PRD 3.4 — implemented)
- **Free tier**: text-only condolences in `virtual_tributes` (`store_item_id` null); guests require owner/admin approval; logged-in users post approved immediately.
- **Paid tier**: `store_items` (Stripe checkout + webhook) attach a virtual item (image/icon) to the same guestbook list.
- **Premium tier**: `store_items.is_premium` + configurable **`highlight_duration_days`** (1–365, default 30): webhook sets `virtual_tributes.highlight_until`; UI shows an animated “lit” spotlight at the top (CSS in `globals.css`, respects `prefers-reduced-motion`).
- **Optional note with purchase**: checkout modal collects up to 200 chars, passed in Stripe metadata and stored in `virtual_tributes.message` for paid rows.
- **Copy/UI**: memorial page uses “Guestbook” naming; admin “Pending guestbook messages” counts unapproved free-text rows (`is_approved` false, `store_item_id` null).
- **Migration**: `supabase/migrations/20260323_store_items_highlight_duration.sql` — run on Supabase.

## Ads (AdSense-style slots — implemented)
- Migration `supabase/migrations/20260317000000_ads_free_ad_slots.sql`: `memorials.ads_free` (default `false`), `ad_slots` table + RLS (public read, admin write), seed rows `memorial_top` / `memorial_bottom`. **Apply on Supabase** before using ads.
- Global toggle: `platform_settings.key = ads_enabled` with value `true` / `false` (also editable under **Admin → Settings**). **Admin → Ads** toggles the same key and edits slot HTML/snippets.
- Memorial UI: fixed slots **below the header** (`memorial_top`) and **above the share/footer** (`memorial_bottom`). Scripts in snippets run client-side via `AdSenseSlot`.
- **Basic vs paid hosting**: On **Basic**, owners can still use “Hide platform ads (manual)” (`ads_free`). **Premium** and **Lifetime** remove platform ads via plan (`src/lib/memorialHostingPlan.ts` + `memorialAds`).
- If Content-Security-Policy blocks third-party scripts, relax policy for AdSense domains as needed.

## Consumer memorial hosting (Basic / Premium / Lifetime)
- Migration `supabase/migrations/20260328_memorial_hosting_plans.sql`: enum `memorial_hosting_plan`, columns `hosting_plan`, `plan_expires_at`, `stripe_subscription_id`, `last_hosting_checkout_session_id` on `memorials`.
- Checkout: `POST /api/stripe/memorial-plan-checkout` with body `{ memorial_id, memorial_slug, plan: "premium_monthly" | "premium_yearly" | "lifetime" }`. Env: `STRIPE_PRICE_MEMORIAL_PREMIUM_MONTHLY`, `STRIPE_PRICE_MEMORIAL_PREMIUM_YEARLY`, `STRIPE_PRICE_MEMORIAL_LIFETIME`.
- Owner UI: `/memorials/[slug]/upgrade`; marketing compare table: `/plans`.
- Webhook `POST /api/stripe/webhook`: `checkout.session.completed` with `metadata.checkout_kind = memorial_hosting` updates the memorial (idempotent via `last_hosting_checkout_session_id`); `customer.subscription.updated` / `deleted` sync Premium expiry / downgrade.

## B2B Partner (MVP demo — implemented in app)
- Migration `supabase/migrations/20260317200000_b2b_partner.sql`: `memorials.managed_by_partner_id`, RLS (insert WITH CHECK for partner column, select/update/delete for managed memorials), unique index on `b2b_subscriptions(provider_subscription_id)` for webhook upserts. **Run this SQL on Supabase before using B2B.**
- Stripe: `POST /api/stripe/b2b-checkout` (subscription mode, `STRIPE_B2B_PRICE_ID`); `POST /api/stripe/b2b-webhook` with **`STRIPE_B2B_WEBHOOK_SECRET`** (separate endpoint from tribute webhook).
- Dashboard `/dashboard/b2b`: subscribe CTA or bulk-create memorials (max 10) when subscription `active`.
- Admin `/admin/users`: **Make B2B** sets `profiles.role = b2b` and upserts an active `b2b_subscriptions` row with `provider_subscription_id = admin_grant:<user_id>` for testing.

## Auth redirects (post-login `next`)
- **`safeAuthRedirectPath`** (`src/lib/safeAuthRedirect.ts`): only allows in-app paths (blocks `//`, `://`, etc.) for `next` query values.
- **Email/password sign-in** (`/auth/login`): after success, redirects to `next` when valid; **Sign up** link preserves `next`. **Sign up** uses the same `next` for `emailRedirectTo` → `/auth/callback?next=…`.
- **OAuth callback** (`/auth/callback`): applies the same sanitizer before redirect.
- **Middleware**: unauthenticated visits to `/admin/*` or `/dashboard/*` redirect to `/auth/login?next=<original path + query>`.
- **Memorial owner flows**: `/memorials/[slug]/edit` → login with `next` when signed out; signed-in non-owners go to the public memorial. `/memorials/[slug]/upgrade` → login with `next` (including `checkout` query when present) when signed out.

## Current app routing skeleton
See `src/app/*` for placeholders (home, auth pages, memorials sections, dashboard, admin sections).

