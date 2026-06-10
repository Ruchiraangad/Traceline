# Traceline — Claude Code Project Memory

## What This Project Is
Traceline is a personal blood test tracking app. Users upload lab result PDFs from any provider (Quest, LabCorp, hospital systems). AI extracts the biomarkers, stores them over time, and visualizes trends across tests. The insight is always in the trend, never the single snapshot.

## The Developer
- Learning project. Goal is to become a solid engineer before September.
- Has lost some coding muscle but can read and understand code well.
- Understands software conceptually and what it can accomplish.
- Claude writes the code. Developer reads, understands, and learns from everything written.
- Do NOT just hand over code without explanation. Always explain what a block does and why it's structured that way.

## Core Technical Problem RAG Solves
Every lab PDF is formatted differently. Quest, LabCorp, and hospital systems each have their own layout. A rigid parser can't handle all formats. The Claude API reads any PDF's raw text and extracts structured data regardless of format. This is the central AI mechanic of the product.

## Data Pipeline (The Spine of the App)
```
User uploads PDF
      ↓
Send PDF directly to Claude API as a document (no separate text extraction)
      ↓
Claude returns structured JSON: { biomarker, value, unit, reference_range, tested_at }
      ↓
Validate each biomarker individually with zod; drop and log any that don't match
      ↓
Store valid rows in Postgres (via Supabase)
      ↓
Frontend queries and renders trend charts (Recharts)
```

## Tech Stack
- **Framework:** Next.js (App Router) — frontend and backend API routes in one repo
- **Language:** TypeScript
- **Database:** Supabase (Postgres) — also handles user auth
- **AI:** Claude API (claude-sonnet-4-6) for PDF extraction
- **PDF parsing:** pdf-parse (Node library, extracts raw text)
- **Charts:** Recharts
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

## Project Name
Traceline

## Coding Rules
- Always use TypeScript, never plain JavaScript
- Use async/await, never .then() chains
- Keep API routes small — logic goes in separate service files, not inline in the route
- Name files and functions clearly; no abbreviations unless industry standard (e.g. PDF, API)
- Always validate data coming from the Claude API before inserting into the database
- Comment non-obvious logic; don't comment obvious things
- When building a new feature, explain the approach before writing code

## Architecture Rules
- API routes live in `app/api/`
- Reusable logic lives in `lib/` (e.g. `lib/extract.ts`, `lib/supabase.ts`)
- React components live in `components/` — page-level components (e.g. `DashboardPage.tsx`, `TrendsPage.tsx`) live directly in `components/`; shared UI primitives (`Button`, `Card`, `Input`, `ErrorState`, `ConfirmDialog`, `PageHeader`, `FileDropzone`) live in `components/ui/`
- Database types live in `types/`
- Never put business logic directly in a React component

## Current Build Status
<!-- BEGIN STATE -->
Status: Deployed
Last session: 2026-06-10
Working on: —
Next step: Pick next post-MVP feature (see linkedin.txt "What's Next")
Blocked: Nothing
<!-- END STATE -->

## What's Been Built
- Next.js project initialized with TypeScript, Tailwind, ESLint, App Router
- Dependencies: @anthropic-ai/sdk, @supabase/supabase-js, pdf-parse, recharts
- Supabase project: uploads + biomarkers tables, RLS with user-scoped policies
- lib/supabase.ts — typed Supabase client
- lib/extract.ts — sends PDF buffer directly to Claude as a document, parses JSON response
- types/database.ts — TypeScript types satisfying Supabase's GenericSchema constraint
- app/api/upload/route.ts — auth → receive PDF → Claude extraction → Supabase insert
- app/auth/page.tsx — email/password sign in / sign up with mode toggle
- app/page.tsx — authenticated dashboard, lists uploads with timestamps and biomarker counts
- app/chart/page.tsx — all biomarker trend charts in a 2-column grid, sorted by data richness
- components/ui/ — shared UI primitives: Button (variant prop: primary/secondary/ghost/link/danger), Card, Input, ErrorState (with retry), ConfirmDialog
- components/DashboardPage.tsx, TrendsPage.tsx, AuthForm.tsx — page-level components (app/*/page.tsx are now thin wrappers around these); dashboard and trends show an error state with retry on a failed Supabase query
- components/UploadDetailPage.tsx + app/uploads/[id]/page.tsx — per-upload page listing its biomarkers, with a delete flow (removes the upload and its biomarker rows, with confirmation)
- lib/extract.ts — biomarkers are validated individually against a zod schema; malformed entries are logged and dropped instead of discarding the whole batch
- components/ui/Button.tsx — `loading` prop shows a centered spinner in place of the label (label kept via `invisible` so the button doesn't resize); `disabled:opacity-50 disabled:cursor-not-allowed` now applied consistently across all variants
- components/ui/ProgressBar.tsx — thin indeterminate progress bar (custom `animate-progress-indeterminate` keyframe in app/globals.css)
- Loading feedback added to every async/navigation button: sign in/up, dashboard nav (Trends/Upload/Sign out), back buttons, delete confirmation; upload page shows the progress bar + "Retrieving your data..." while Claude extracts biomarkers
- components/ui/FileDropzone.tsx — drag-and-drop + click-to-browse zone for multiple PDFs; rejects non-PDF files and files over 32MB client-side, and renders per-file status (uploading spinner / success checkmark with biomarker count / error message) via a `statuses` prop
- components/ui/PageHeader.tsx — shared back-button + centered title header bar (parameterized by `title`, `backHref`, `maxWidthClassName`); replaces the header markup that had been copy-pasted in TrendsPage and UploadDetailPage
- components/UploadPage.tsx + app/upload/page.tsx — extracted to match the page-level component pattern; checks auth on mount (redirects to /auth like other pages), supports selecting and uploading multiple files sequentially against the existing single-file /api/upload route, and shows a "✓ Done — N biomarkers found across N files" summary before redirecting to the dashboard

## Key Technical Decisions
- Dropped pdf-parse text extraction in favour of Claude's native PDF document support — handles image-based and text-based PDFs equally
- tested_at is nullable — some lab PDFs have no collection date
- JSON parsing has two fallbacks: strip markdown fences, then regex-extract first [...] array in case Claude adds prose
- serverExternalPackages includes pdf-parse to avoid Turbopack worker bundling issues
- Biomarker validation is per-item, not per-array — one malformed entry (e.g. an empty `unit` on a dimensionless result like a ratio) is logged and dropped rather than rejecting the whole extraction
- `unit` accepts an empty string — some results (ratios, pH) are genuinely unitless, and the database column doesn't require non-empty
- Destructive actions (deleting an upload) use a custom ConfirmDialog, not the browser's `confirm()`
- Deleting an upload removes its `biomarkers` rows before the `uploads` row — no DB-level cascade is assumed
- A button's `loading` state must NOT be cleared before a successful `router.push` — clearing it first causes a visible flash back to the idle label right before navigation. Only reset loading state on error paths; on success let it persist until the page unmounts
- Multi-file upload reuses the existing single-file `/api/upload` route — the client loops and POSTs each file separately, so each PDF becomes its own `uploads` row. No backend changes were needed
- On the upload page, "Upload" only (re)submits files that haven't reached `success` status yet — a partial failure (e.g. one PDF with no extractable biomarkers) can be retried without re-inserting files that already succeeded
- The 32MB client-side file size cap in FileDropzone matches the PDF size limit for documents sent to the Claude API

## MVP Scope (Build This First, Nothing Else)
1. User auth (Supabase handles this)
2. PDF upload UI
3. Text extraction from PDF
4. Claude API call to extract biomarkers → returns JSON
5. Store biomarker rows in Postgres
6. Dashboard showing a list of past uploads
7. Chart showing one biomarker's trend over time

Everything else (explanations, alerts, sharing, mobile) is post-MVP.

## What Not To Do
- Do not scaffold features outside the MVP scope without being asked
- Do not use any ORM (use raw SQL or Supabase client directly)
- Do not add UI libraries beyond Tailwind (no shadcn, no MUI, no Radix unless asked)
- Do not suggest switching the stack
- Do not write code the developer won't be able to read and understand