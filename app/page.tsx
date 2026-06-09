'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { UploadRow } from '@/types/database'

type UploadWithCount = UploadRow & { biomarkers: { count: number }[] }

export default function Dashboard() {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('uploads')
        .select('*, biomarkers(count)')
        .order('uploaded_at', { ascending: false })

      setUploads((data as UploadWithCount[]) ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  async function handleSignOut() {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Traceline</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/upload')}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Upload
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </div>

        {uploads.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 p-12 text-center">
            <p className="text-zinc-500">No uploads yet.</p>
            <button
              onClick={() => router.push('/upload')}
              className="mt-4 text-sm text-zinc-300 underline hover:text-white"
            >
              Upload your first lab report
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {uploads.map(upload => (
              <li
                key={upload.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4"
              >
                <p className="font-medium text-zinc-100">{upload.filename}</p>
                <div className="mt-1 flex gap-4 text-sm text-zinc-500">
                  <span>{new Date(upload.uploaded_at).toLocaleString()}</span>
                  <span>{upload.biomarkers[0]?.count ?? 0} biomarkers</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
