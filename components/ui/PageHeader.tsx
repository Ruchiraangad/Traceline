'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type PageHeaderProps = {
  title: string
  backHref: string
  // Lets each page match the max-width of its own content area, so the
  // back button and title line up with the content below.
  maxWidthClassName?: string
}

export default function PageHeader({ title, backHref, maxWidthClassName = 'max-w-3xl' }: PageHeaderProps) {
  const router = useRouter()
  const [navigatingBack, setNavigatingBack] = useState(false)

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50">
      <div className={`mx-auto ${maxWidthClassName} px-4 py-3 flex items-center justify-between`}>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          loading={navigatingBack}
          onClick={() => { setNavigatingBack(true); router.push(backHref) }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-16" />
      </div>
    </div>
  )
}
