import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type ExtractedBiomarker = {
  biomarker: string
  value: number
  unit: string
  reference_range: string | null
  tested_at: string
}

// Takes raw text from a PDF and asks Claude to extract structured biomarker data
export async function extractBiomarkers(pdfText: string): Promise<ExtractedBiomarker[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Extract all biomarker results from this lab report text. Return a JSON array only, no explanation.

Each object must have:
- biomarker: string (e.g. "Hemoglobin", "Glucose")
- value: number
- unit: string (e.g. "g/dL", "mg/dL")
- reference_range: string or null (e.g. "13.5-17.5")
- tested_at: string (ISO 8601 date, e.g. "2024-03-15")

Lab report text:
${pdfText}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)

  if (!Array.isArray(parsed)) {
    throw new Error('Claude did not return an array')
  }

  return parsed as ExtractedBiomarker[]
}
