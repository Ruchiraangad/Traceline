'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { BiomarkerRow } from '@/types/database'

type BiomarkerGroup = {
  name: string
  unit: string
  data: { date: string; value: number }[]
}

function groupByBiomarker(rows: BiomarkerRow[]): BiomarkerGroup[] {
  const map = new Map<string, BiomarkerRow[]>()

  for (const row of rows) {
    const existing = map.get(row.biomarker) ?? []
    map.set(row.biomarker, [...existing, row])
  }

  return Array.from(map.entries())
    .map(([name, readings]) => ({
      name,
      unit: readings[0].unit,
      data: readings
        .sort((a, b) => (a.tested_at ?? a.created_at) > (b.tested_at ?? b.created_at) ? 1 : -1)
        .map(r => ({
          date: r.tested_at ?? r.created_at.slice(0, 10),
          value: r.value,
        })),
    }))
    .sort((a, b) => b.data.length - a.data.length)
}

export default function ChartPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<BiomarkerGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('biomarkers')
        .select('*')

      if (data) setGroups(groupByBiomarker(data as BiomarkerRow[]))
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-500 hover:text-zinc-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Trends</h1>
          <div className="w-16" />
        </div>

        {groups.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 p-12 text-center">
            <p className="text-zinc-500">No data yet. Upload a lab report first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {groups.map(group => (
              <div key={group.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-1 font-medium text-zinc-100">{group.name}</p>
                <p className="mb-4 text-xs text-zinc-500">{group.unit}</p>
                {group.data.length < 2 ? (
                  <p className="py-8 text-center text-xs text-zinc-600">
                    Need more readings to show a trend
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={group.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#52525b', fontSize: 10 }} width={40} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px' }}
                        labelStyle={{ color: '#a1a1aa' }}
                        itemStyle={{ color: '#f4f4f5' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                        dot={{ fill: '#ffffff', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
