import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractBiomarkers } from '@/lib/extract'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  // Create a Supabase client using the user's auth token so RLS applies correctly
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pull the file out of the multipart form data
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  // Pass the PDF buffer directly to Claude — no text extraction step needed
  const buffer = Buffer.from(await file.arrayBuffer())

  let biomarkers
  try {
    biomarkers = await extractBiomarkers(buffer)
  } catch (err) {
    console.error('Extraction error:', err)
    return NextResponse.json({ error: 'Could not read biomarkers from this PDF' }, { status: 422 })
  }

  if (biomarkers.length === 0) {
    return NextResponse.json({ error: 'No biomarkers found in this PDF' }, { status: 422 })
  }

  // Record the upload
  const { data: upload, error: uploadError } = await supabase
    .from('uploads')
    .insert({ user_id: user.id, filename: file.name })
    .select()
    .single()

  if (uploadError || !upload) {
    return NextResponse.json({ error: 'Failed to save upload' }, { status: 500 })
  }

  // Insert one row per extracted biomarker
  const rows = biomarkers.map(b => ({
    user_id: user.id,
    upload_id: upload.id,
    biomarker: b.biomarker,
    value: b.value,
    unit: b.unit,
    reference_range: b.reference_range,
    tested_at: b.tested_at,
  }))

  const { error: biomarkerError } = await supabase
    .from('biomarkers')
    .insert(rows)

  if (biomarkerError) {
    console.error('Biomarker insert error:', biomarkerError)
    console.error('Rows attempted:', JSON.stringify(rows, null, 2))
    return NextResponse.json({ error: 'Failed to save biomarkers', detail: biomarkerError.message }, { status: 500 })
  }

  return NextResponse.json({ upload_id: upload.id, count: biomarkers.length })
}
