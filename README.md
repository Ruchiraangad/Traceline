# Traceline

Upload a blood test PDF from any lab, whether it's Quest, LabCorp, or a hospital portal. Claude reads it and extracts every biomarker: name, value, unit, reference range, date. Each new report adds to your history, so instead of a folder of random PDFs you get a timeline of how your bloodwork has actually moved.

---

## Screenshots

<table>
  <tr>
    <td rowspan="2"><img src="docs/trends_gif.gif" width="480" alt="Walkthrough" /></td>
    <td><img src="docs/main_dashboard.png" width="280" alt="Dashboard" /></td>
  </tr>
  <tr>
    <td><img src="docs/upload_details.png" width="280" alt="Upload details" /></td>
  </tr>
</table>

**Live app:** [traceline-six.vercel.app](https://traceline-six.vercel.app)

---

## Examples

Questions Traceline is built to answer:

- How has my ferritin changed during marathon training?
- How has my A1C moved since I started losing weight?
- What happened to my cholesterol after I changed my diet?
- How have my thyroid markers trended over the last two years?

---

## Why It's Interesting

Most "chat with your documents" tools chunk up text and embed it for semantic search. You ask a question, it finds a relevant chunk, and an LLM summarizes it. That works fine for finding one fact in one document.

Traceline takes a different approach. Each lab report goes to Claude as a PDF and comes back as structured rows, one per biomarker, with a value, unit, and date. No chunking, no embeddings, no retrieval step.

That gives you a dataset you can query, not an archive you can search. A ferritin value from a 2022 report and one from a 2026 report land in the same table as two comparable rows. So "ferritin over 18 months" isn't a document search problem anymore. It's a SQL query and a line chart.

---

## Architecture

```
PDF upload
    ↓
Claude Document API  →  structured JSON
    ↓
Zod validation (per biomarker)
    ↓
Postgres (Supabase)
    ↓
Trend charts (Recharts)
```

---

## Built With

- Next.js (App Router)
- TypeScript
- Supabase (Postgres + auth)
- Claude API
- Tailwind CSS
- Recharts
- Vercel

---

## Future Work

- Natural language querying ("how's my cholesterol trending?")
- Automated trend analysis and flags
- Training/fitness data integrations
- More health analytics
