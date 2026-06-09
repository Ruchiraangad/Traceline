import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type ExtractedBiomarker = {
  biomarker: string
  value: number
  unit: string
  reference_range: string | null
  tested_at: string
}

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
- unit: string (e.g. "g/dL", "mg/dL")
- reference_range: string or null (e.g. "13.5-17.5")
- tested_at: string (ISO 8601 date, e.g. "2024-03-15")

If no date is found in the report, use null for tested_at.`,
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(text)

  if (!Array.isArray(parsed)) {
    throw new Error('Claude did not return an array')
  }

  return parsed as ExtractedBiomarker[]
}
