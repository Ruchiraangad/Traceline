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
Extract raw text from PDF (pdf-parse)
      ↓
Send text to Claude API with extraction prompt
      ↓
Claude returns structured JSON: { biomarker, value, unit, reference_range, date }
      ↓
Validate and store rows in Postgres (via Supabase)
      ↓
Frontend queries and renders trend charts (Recharts)
```

## Tech Stack
- **Framework:** Next.js (App Router) — frontend and backend API routes in one repo
- **Language:** TypeScript
- **Database:** Supabase (Postgres) — also handles user auth
- **AI:** Claude API (claude-sonnet-4-20250514) for PDF extraction
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
- React components live in `components/`
- Database types live in `types/`
- Never put business logic directly in a React component

## Current Build Status
<!-- BEGIN STATE -->
Status: In progress — end-to-end pipeline built, debugging first upload attempt
Last session: 2026-06-09
Working on: First real upload test — hitting a 500 on /api/upload
Next step: Fix the 500 error on upload, then sign up via /auth and test full pipeline
Blocked: Runtime crash in upload route (likely pdf-parse or auth check)
<!-- END STATE -->

## What's Been Built
- Next.js project initialized with TypeScript, Tailwind, ESLint
- Dependencies installed: @anthropic-ai/sdk, @supabase/supabase-js, pdf-parse
- Supabase project created, tables created (uploads, biomarkers), RLS enabled
- lib/supabase.ts — Supabase client
- lib/extract.ts — Claude API call to extract biomarkers from PDF text
- types/database.ts — TypeScript types matching Supabase schema
- app/api/upload/route.ts — POST endpoint: auth check → pdf-parse → Claude → Supabase insert
- app/auth/page.tsx — Email/password sign in / sign up
- app/upload/page.tsx — File picker UI that posts to /api/upload with Bearer token
- pdf-parse v2 uses class-based API (PDFParse, not a function)

## MVP Scope (Build This First, Nothing Else)
1. User auth (Supabase handles this)
2. PDF upload UI
3. Text extraction from PDF
4. Claude API call to extract biomarkers → returns JSON
5. Store biomarker rows in Postgres
6. Dashboard showing a list of past uploads
7. Chart showing one biomarker's trend over time

Everything else (explanations, alerts, sharing, mobile) is post-MVP.

## Background Context (How This Project Came About)
Developer is working through a summer learning curriculum before school starts in September (~12 weeks). Goal is to build 1-2 real AI-native projects that ship and deploy. The three project categories being targeted are:
1. RAG System — Traceline is this project
2. Autonomous Agents — Prospektr (lead-gen pipeline) is the planned follow-up
3. Eval Harness — future project

IdeaBrowser.com was the source of initial idea discovery. Traceline was chosen because it teaches foundational engineering skills (file handling, database design, API integration, charting, auth) while having a real AI mechanic at its center.

## What Not To Do
- Do not scaffold features outside the MVP scope without being asked
- Do not use any ORM (use raw SQL or Supabase client directly)
- Do not add UI libraries beyond Tailwind (no shadcn, no MUI, no Radix unless asked)
- Do not suggest switching the stack
- Do not write code the developer won't be able to read and understand