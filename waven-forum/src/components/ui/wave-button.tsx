'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface WaveButtonProps {
  postSlug: string
  initialWaved?: boolean
  initialCount: number
  onWaveChange?: (waved: boolean, count: number) => void
}

export function WaveButton({ 
  postSlug, 
  initialWaved = false, 
  initialCount, 
  onWaveChange 
}: WaveButtonProps) {
  const { data: session } = useSession()
  const [waved, setWaved] = useState(initialWaved)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleWave = async () => {
    if (!session) {
      // Could redirect to sign in or show a modal
      return
    }

    if (loading) return

    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${postSlug}/wave`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setWaved(data.waved)
        setCount(data.waveCount)
        onWaveChange?.(data.waved, data.waveCount)
        
        // Show achievement notifications if any
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement: any) => {
            // Simple browser notification for now
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`🎉 Achievement Unlocked!`, {
                body: `${achievement.name}: ${achievement.description}`,
                icon: '/favicon.ico'
              })
            }
          })
        }
      }
    } catch (error) {
      console.error('Wave error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleWave}
      disabled={!session || loading}
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
        'hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        waved 
          ? 'text-red-500 bg-red-50' 
          : 'text-gray-500 hover:text-red-500',
        loading && 'animate-pulse'
      )}
    >
      {waved ? (
        <HeartSolidIcon className={cn(
          'w-5 h-5 transition-transform duration-200',
          loading ? 'scale-110' : 'scale-100'
        )} />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">{count}</span>
      {!session && (
        <span className="sr-only">Sign in to wave</span>
      )}
    </button>
  )
}