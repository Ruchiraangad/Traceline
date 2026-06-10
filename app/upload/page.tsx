'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [navigatingBack, setNavigatingBack] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setStatus(null)
    setLoading(true)

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

    if (!response.ok) {
      setStatus(`Error: ${result.error}`)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="px-4 py-4">
        <Button variant="ghost" loading={navigatingBack} onClick={() => { setNavigatingBack(true); router.push('/') }}>
          ← Back
        </Button>
      </div>
      <div className="flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-sm bg-zinc-900 p-8">
          <h1 className="mb-6 text-xl font-semibold text-zinc-100">Upload a lab report</h1>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-zinc-400"
            />
            <Button type="submit" disabled={!file} loading={loading}>
              Upload
            </Button>
          </form>
          {loading && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-zinc-400">Retrieving your data...</p>
              <ProgressBar />
            </div>
          )}
          {status && (
            <p className={`mt-4 text-sm ${status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {status}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
