'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ErrorState from '@/components/ui/ErrorState'
import type { UploadRow, BiomarkerRow } from '@/types/database'

type UploadDetailPageProps = {
  uploadId: string
}

export default function UploadDetailPage({ uploadId }: UploadDetailPageProps) {
  const router = useRouter()
  const [upload, setUpload] = useState<UploadRow | null>(null)
  const [biomarkers, setBiomarkers] = useState<BiomarkerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // Bumping this re-runs the effect below — used by ErrorState's retry button.
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const [uploadResult, biomarkerResult] = await Promise.all([
        supabase.from('uploads').select('*').eq('id', uploadId).single(),
        supabase.from('biomarkers').select('*').eq('upload_id', uploadId).order('biomarker', { ascending: true }),
      ])

      const fetchError = uploadResult.error || biomarkerResult.error
      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setUpload(uploadResult.data)
      setBiomarkers(biomarkerResult.data ?? [])
      setLoading(false)
    }

    load()
  }, [router, uploadId, retryCount])

  function retry() {
    setLoading(true)
    setError(null)
    setRetryCount(c => c + 1)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    // Delete the biomarker rows before the upload row they reference,
    // rather than relying on a database-level cascade to do it for us.
    const { error: biomarkerError } = await supabase
      .from('biomarkers')
      .delete()
      .eq('upload_id', uploadId)

    if (biomarkerError) {
      setDeleteError(biomarkerError.message)
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }

    const { error: uploadError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId)

    if (uploadError) {
      setDeleteError(uploadError.message)
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }

    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  if (error || !upload) {
    return <ErrorState message="Couldn't load this upload." detail={error ?? 'Upload not found.'} onRetry={retry} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.push('/')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h1 className="text-lg font-semibold">Upload details</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="mb-6 bg-zinc-900 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-zinc-100">{upload.filename}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Uploaded{' '}
                {new Date(upload.uploaded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                at{' '}
                {new Date(upload.uploaded_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete upload'}
            </Button>
          </div>
          {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}
        </Card>

        {biomarkers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-zinc-500">No biomarkers were extracted from this upload.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="px-4 py-2 font-medium">Biomarker</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                  <th className="px-4 py-2 font-medium">Reference range</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {biomarkers.map(b => (
                  <tr key={b.id} className="border-b border-zinc-900 last:border-0">
                    <td className="px-4 py-2 text-zinc-100">{b.biomarker}</td>
                    <td className="px-4 py-2 text-zinc-100">{b.value} {b.unit}</td>
                    <td className="px-4 py-2 text-zinc-500">{b.reference_range ?? '—'}</td>
                    <td className="px-4 py-2 text-zinc-500">{b.tested_at ?? upload.uploaded_at.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this upload?"
        message="This removes the upload and all its biomarkers. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
