# Traceline

Upload lab result PDFs from any provider. AI extracts every biomarker automatically. Track trends over time.

## What it does

- Upload a blood test PDF (Quest, LabCorp, or any other provider)
- Claude reads the PDF natively and extracts all numeric biomarker results
- Results are stored in Postgres and visualized as trend charts
- Works with both text-based and image-based PDFs

## Tech stack

- **Next.js** (App Router) — frontend + backend in one repo
- **TypeScript**
- **Supabase** — Postgres database and user auth
- **Anthropic Claude API** — PDF reading and biomarker extraction
- **Recharts** — trend charts
- **Tailwind CSS**

## Local development

### 1. Clone and install

```bash
git clone https://github.com/Ruchiraangad/Traceline.git
cd Traceline
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run this SQL in the SQL editor:

```sql
create table uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  filename text not null,
  uploaded_at timestamptz default now()
);

create table biomarkers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  upload_id uuid references uploads(id) on delete cascade,
  biomarker text not null,
  value numeric not null,
  unit text not null,
  reference_range text,
  tested_at date,
  created_at timestamptz default now()
);

alter table uploads enable row level security;
alter table biomarkers enable row level security;

create policy "users can only access their own uploads"
on uploads for all using (auth.uid() = user_id);

create policy "users can only access their own biomarkers"
on biomarkers for all using (auth.uid() = user_id);
```

In Supabase: go to **Authentication → Providers → Email** and disable "Confirm email" for local testing.

### 3. Set up environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

- Supabase keys: **Settings → API** in your Supabase project
- Anthropic key: [console.anthropic.com](https://console.anthropic.com)

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add the three environment variables from `.env.local` in the Vercel project settings
4. Deploy

Vercel detects Next.js automatically. No additional configuration needed.

## Project structure

```
app/
  page.tsx              # Dashboard — lists uploads, links to trends
  auth/page.tsx         # Sign in / sign up
  upload/page.tsx       # PDF upload UI
  chart/page.tsx        # Biomarker trend charts
  api/upload/route.ts   # POST /api/upload — extract and store

lib/
  supabase.ts           # Supabase client
  extract.ts            # Claude API call and JSON parsing

types/
  database.ts           # TypeScript types for Supabase schema
```

## Notes

- Only numeric biomarker results are extracted. Qualitative tests (e.g. HPV Positive/Negative) are intentionally skipped.
- `tested_at` is nullable — some lab PDFs do not include a collection date.
- The Claude model used is `claude-sonnet-4-6`.
