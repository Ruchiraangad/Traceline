import { NextRequest, NextResponse } from 'next/server'

// TODO: wire up pdf-parse, extractBiomarkers, and supabase insert once env vars are set
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Upload endpoint not yet implemented' }, { status: 501 })
}
