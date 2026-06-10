'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import AuthLayout from '@/components/ui/AuthLayout'

type Status = 'checking' | 'ready' | 'invalid'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let resolved = false

    // The reset link in the email carries a recovery token in the URL hash.
    // The Supabase client reads it automatically on load and fires this
    // event once it's been exchanged for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        resolved = true
        setStatus('ready')
      }
    })

    // Covers the case where the session was already set up before this
    // listener attached.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolved = true
        setStatus('ready')
      }
    })

    // If neither fires, the link was missing, invalid, or expired.
    const timeout = setTimeout(() => {
      if (!resolved) setStatus('invalid')
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (status === 'checking') {
    return (
      <AuthLayout>
        <p className="text-center text-sm text-zinc-500">Verifying your reset link...</p>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout>
        <p className="mb-4 text-center text-sm text-zinc-400">
          This password reset link is invalid or has expired.
        </p>
        <Button className="w-full" onClick={() => router.push('/auth')}>
          Back to sign in
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-center text-sm font-medium text-zinc-400">
        Set a new password
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  )
}
