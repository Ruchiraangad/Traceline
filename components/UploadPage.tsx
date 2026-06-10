'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import ProgressBar from '@/components/ui/ProgressBar'
import FileDropzone, { type SelectedFile, type FileUploadStatus } from '@/components/ui/FileDropzone'

export default function UploadPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [statuses, setStatuses] = useState<Record<string, FileUploadStatus>>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  // Files that haven't successfully uploaded yet — these are what the
  // submit button will (re)try, so a partial failure can be retried
  // without re-uploading files that already succeeded.
  const pending = files.filter(f => statuses[f.id]?.state !== 'success')
  const allDone = files.length > 0 && pending.length === 0
  const totalBiomarkers = files.reduce((sum, f) => {
    const status = statuses[f.id]
    return status?.state === 'success' ? sum + status.count : sum
  }, 0)

  // Once every selected file has succeeded, redirect to the dashboard
  // after a brief pause so the success message is actually readable.
  useEffect(() => {
    if (!allDone) return
    const timeout = setTimeout(() => router.push('/'), 1500)
    return () => clearTimeout(timeout)
  }, [allDone, router])

  function handleFilesChange(next: SelectedFile[]) {
    // Drop any leftover status entries for files that were removed.
    const ids = new Set(next.map(f => f.id))
    setStatuses(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => ids.has(id))))
    setFiles(next)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (pending.length === 0 || uploading) return

    setUploading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    for (const { id, file } of pending) {
      setStatuses(prev => ({ ...prev, [id]: { state: 'uploading' } }))

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        })
        const result = await response.json()

        if (!response.ok) {
          setStatuses(prev => ({ ...prev, [id]: { state: 'error', message: result.error ?? 'Upload failed' } }))
          continue
        }

        setStatuses(prev => ({ ...prev, [id]: { state: 'success', count: result.count } }))
      } catch {
        setStatuses(prev => ({ ...prev, [id]: { state: 'error', message: 'Upload failed' } }))
      }
    }

    setUploading(false)
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <PageHeader title="Upload" backHref="/" maxWidthClassName="max-w-2xl" />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="bg-zinc-900 p-8">
          <p className="mb-6 text-sm text-zinc-400">
            Drop in lab report PDFs from any provider — Quest, LabCorp, or your hospital portal.
          </p>

          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <FileDropzone
              files={files}
              onFilesChange={handleFilesChange}
              statuses={statuses}
              disabled={uploading}
            />

            <Button type="submit" disabled={pending.length === 0} loading={uploading}>
              {pending.length > 1 ? `Upload ${pending.length} files` : 'Upload'}
            </Button>
          </form>

          {uploading && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-zinc-400">Retrieving your data...</p>
              <ProgressBar />
            </div>
          )}

          {allDone && (
            <p className="mt-4 text-sm text-green-400">
              ✓ Done — {totalBiomarkers} biomarker{totalBiomarkers === 1 ? '' : 's'} found across{' '}
              {files.length} file{files.length === 1 ? '' : 's'}. Redirecting...
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
