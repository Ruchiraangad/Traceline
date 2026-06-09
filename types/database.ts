export type BiomarkerRow = {
  id: string
  user_id: string
  upload_id: string
  biomarker: string
  value: number
  unit: string
  reference_range: string | null
  tested_at: string | null
  created_at: string
}

export type BiomarkerInsert = {
  user_id: string
  upload_id: string
  biomarker: string
  value: number
  unit: string
  reference_range: string | null
  tested_at: string | null
}

export type UploadRow = {
  id: string
  user_id: string
  filename: string
  uploaded_at: string
}

export type UploadInsert = {
  user_id: string
  filename: string
}

export type Database = {
  public: {
    Tables: {
      uploads: {
        Row: UploadRow
        Insert: UploadInsert
        Update: Partial<UploadInsert>
        Relationships: []
      }
      biomarkers: {
        Row: BiomarkerRow
        Insert: BiomarkerInsert
        Update: Partial<BiomarkerInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
