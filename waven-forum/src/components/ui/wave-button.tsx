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
        'flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed shadow-lg',
        waved 
          ? 'text-white bg-gradient-to-r from-ocean-500 to-wave-500 shadow-ocean-500/25' 
          : 'text-ocean-600 bg-gradient-to-r from-ocean-50 to-wave-50 hover:from-ocean-100 hover:to-wave-100 border border-ocean-200',
        loading && 'animate-pulse'
      )}
    >
      {waved ? (
        <span className={cn(
          'text-lg transition-transform duration-300',
          loading ? 'scale-125 animate-bounce' : 'scale-100'
        )}>🌊</span>
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="text-sm font-semibold">{count}</span>
      {!session && (
        <span className="sr-only">Sign in to wave</span>
      )}
    </button>
  )
}