'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Auto sign in after successful registration
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/')
          router.refresh()
        }
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wave-50 via-ocean-50 to-lavender-50 py-12 px-4 sm:px-6 lg:px-8 bg-wave-pattern">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 animated-gradient rounded-2xl flex items-center justify-center shadow-2xl float-animation">
              <span className="text-2xl wave-animation">🌊</span>
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-4xl font-bold gradient-text mb-2">Waven</h1>
            <p className="text-wave-600 font-medium">Make Waves</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join the Community
          </h2>
          <p className="text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="font-semibold text-wave-600 hover:text-wave-700 transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="glass-effect rounded-2xl p-8 shadow-2xl border-0 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password (min. 6 characters)"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-gradient-to-r from-wave-500 to-ocean-500 hover:from-wave-600 hover:to-ocean-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            loading={loading}
            disabled={!name || !email || !password || !confirmPassword}
          >
            Join Waven Community
          </Button>

          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-wave-600 hover:text-wave-700 font-medium transition-colors">
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}