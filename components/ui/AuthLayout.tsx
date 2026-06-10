import type { ReactNode } from 'react'
import Card from '@/components/ui/Card'

// Shared gradient backdrop + logo card used by both the sign in/up form
// and the password reset form, so the two pages look like one flow.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4">
      <Card className="w-full max-w-sm bg-zinc-900/80 backdrop-blur p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">trace</span>
            <span className="text-2xl font-bold text-zinc-600">line</span>
          </div>
        </div>
        {children}
      </Card>
    </div>
  )
}
