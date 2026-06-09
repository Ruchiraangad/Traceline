'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setStatus(null)
    setLoading(true)

    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setStatus('Not signed in.')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setStatus(`Error: ${result.error}`)
      return
    }

    setStatus(`Done — ${result.count} biomarkers extracted.`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 border border-zinc-800">
        <h1 className="mb-6 text-xl font-semibold text-zinc-100">Upload a lab report</h1>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-zinc-400"
          />

          <button
            type="submit"
            disabled={!file || loading}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upload'}
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-sm ${status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
