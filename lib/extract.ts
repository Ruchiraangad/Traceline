import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const client = new Anthropic()

// Describes the shape we require from Claude's response. The TypeScript type
// below is inferred from this, so the two can never drift apart.
const biomarkerSchema = z.object({
  biomarker: z.string().min(1),
  value: z.number(),
  unit: z.string(),
  reference_range: z.string().nullable(),
  tested_at: z.string().nullable(),
})

export type ExtractedBiomarker = z.infer<typeof biomarkerSchema>

// Sends the PDF directly to Claude as a document — works for both text-based and image-based PDFs
export async function extractBiomarkers(pdfBuffer: Buffer): Promise<ExtractedBiomarker[]> {
  const base64 = pdfBuffer.toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Extract all biomarker results from this lab report. Respond with a raw JSON array only — no markdown, no code fences, no explanation. Just the JSON.

Each object must have:
- biomarker: string (e.g. "Hemoglobin", "Glucose")
- value: number
- unit: string (e.g. "g/dL", "mg/dL"), or "" if the result has no unit (e.g. ratios, pH)
- reference_range: string or null (e.g. "13.5-17.5")
- tested_at: string (ISO 8601 date, e.g. "2024-03-15")

If no date is found in the report, use null for tested_at.`,
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  // Strip markdown fences, then fall back to extracting the first JSON array found in the response
  const stripped = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const match = stripped.startsWith('[') ? stripped : stripped.match(/\[[\s\S]*\]/)?.[0] ?? stripped
  const parsed = JSON.parse(match)

  if (!Array.isArray(parsed)) {
    throw new Error('Claude returned data that was not a JSON array')
  }

  // Validate each entry individually so one malformed result (e.g. a value
  // Claude couldn't fit into the schema) doesn't discard an otherwise-valid batch.
  const biomarkers: ExtractedBiomarker[] = []
  for (const [index, item] of parsed.entries()) {
    const result = biomarkerSchema.safeParse(item)
    if (result.success) {
      biomarkers.push(result.data)
    } else {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
      console.warn(`Skipping biomarker at index ${index} (${issues})`)
    }
  }

  return biomarkers
}
