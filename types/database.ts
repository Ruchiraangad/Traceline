export type BiomarkerRow = {
  id: string
  user_id: string
  upload_id: string
  biomarker: string
  value: number
  unit: string
  reference_range: string | null
  tested_at: string
  created_at: string
}

export type UploadRow = {
  id: string
  user_id: string
  filename: string
  uploaded_at: string
}

// Placeholder — will be expanded once Supabase schema is finalized
export type Database = {
  public: {
    Tables: {
      biomarkers: { Row: BiomarkerRow }
      uploads: { Row: UploadRow }
    }
  }
}
