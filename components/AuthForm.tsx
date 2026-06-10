'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import AuthLayout from '@/components/ui/AuthLayout'

type Mode = 'signin' | 'signup' | 'forgot'

export default function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'forgot') {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      // Same message whether or not the email is registered, so this can't
      // be used to check which addresses have accounts.
      setMode('signin')
      setInfo('If an account exists for that email, a password reset link is on its way.')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // signUp doesn't reliably hand back a usable session (e.g. when email
      // confirmation is on), so don't navigate to a dashboard that would just
      // bounce back here. Send the user through sign-in instead.
      setMode('signin')
      setPassword('')
      setConfirmPassword('')
      setInfo('Account created — sign in with your new credentials.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  function toggleMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setConfirmPassword('')
    setError(null)
    setInfo(null)
  }

  function goToForgotPassword() {
    setMode('forgot')
    setError(null)
    setInfo(null)
  }

  function goToSignIn() {
    setMode('signin')
    setError(null)
    setInfo(null)
  }

  return (
    <AuthLayout>
      {/* Keying on `mode` remounts this block on every switch, replaying
          the fade-slide-in animation so the change feels less abrupt. */}
      <div key={mode} className="animate-fade-slide-in">
        <h1 className={`text-center text-sm font-medium text-zinc-400 ${mode === 'forgot' ? 'mb-1' : 'mb-6'}`}>
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
        </h1>
        {mode === 'forgot' && (
          <p className="mb-4 text-center text-xs text-zinc-500">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {mode !== 'forgot' && (
            <div className="flex flex-col gap-1.5">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {mode === 'signin' && (
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    type="button"
                    className="text-xs text-zinc-500"
                    onClick={goToForgotPassword}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-green-400">{info}</p>}

          <Button type="submit" loading={loading}>
            {mode === 'signin' && 'Sign in'}
            {mode === 'signup' && 'Create account'}
            {mode === 'forgot' && 'Send reset link'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {mode === 'forgot' ? (
            <Button variant="link" className="font-medium" onClick={goToSignIn}>
              Back to sign in
            </Button>
          ) : (
            <>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Button variant="link" className="font-medium" onClick={toggleMode}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Button>
            </>
          )}
        </p>
      </div>
    </AuthLayout>
  )
}
