'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import type { UploadRow } from '@/types/database'

type UploadWithCount = UploadRow & { biomarkers: { count: number }[] }

export default function DashboardPage() {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Bumping this re-runs the effect below — used by ErrorState's retry button.
  const [retryCount, setRetryCount] = useState(0)
  // Tracks which nav button was clicked, so only that one shows a spinner.
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('uploads')
        .select('*, biomarkers(count)')
        .order('uploaded_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setUploads((data as UploadWithCount[]) ?? [])
      setLoading(false)
    }

    load()
  }, [router, retryCount])

  function retry() {
    setLoading(true)
    setError(null)
    setRetryCount(c => c + 1)
  }

  function navigate(id: string, path: string) {
    setNavigatingTo(id)
    router.push(path)
  }

  async function handleSignOut() {
    setNavigatingTo('signout')
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Couldn't load your uploads." detail={error} onRetry={retry} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-slide-in">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Traceline</h1>
          <div className="flex gap-3">
            <Button variant="secondary" loading={navigatingTo === 'trends'} onClick={() => navigate('trends', '/chart')}>
              Trends
            </Button>
            <Button loading={navigatingTo === 'upload'} onClick={() => navigate('upload', '/upload')}>
              Upload
            </Button>
            <Button variant="secondary" loading={navigatingTo === 'signout'} onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        {uploads.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-zinc-500">No uploads yet.</p>
            <Button
              variant="link"
              className="mt-4 underline hover:text-white"
              loading={navigatingTo === 'upload-empty'}
              onClick={() => navigate('upload-empty', '/upload')}
            >
              Upload your first lab report
            </Button>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {uploads.map(upload => (
              <Card
                key={upload.id}
                as="li"
                onClick={() => router.push(`/uploads/${upload.id}`)}
                className="group bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 px-5 py-4 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="mt-0.5 text-zinc-600 group-hover:text-zinc-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        {new Date(upload.uploaded_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {new Date(upload.uploaded_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-100">{upload.biomarkers[0]?.count ?? 0}</p>
                    <p className="text-xs text-zinc-500">biomarkers</p>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
