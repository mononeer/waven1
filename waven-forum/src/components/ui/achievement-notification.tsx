'use client'

import { useState, useEffect } from 'react'
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  points: number
}

interface AchievementNotificationProps {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementNotification({ achievements, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // Wait for animation
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const rarityColors = {
    COMMON: 'from-gray-500 to-gray-600',
    RARE: 'from-blue-500 to-blue-600',
    EPIC: 'from-purple-500 to-purple-600',
    LEGENDARY: 'from-yellow-500 to-yellow-600'
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`max-w-sm bg-white rounded-lg shadow-lg border-l-4 border-transparent bg-gradient-to-r ${rarityColors[achievement.rarity]} p-1 transform transition-all duration-300 ${
            visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    🎉 Achievement Unlocked!
                  </p>
                  <button
                    onClick={() => {
                      setVisible(false)
                      setTimeout(onClose, 300)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg">{achievement.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">+{achievement.points} points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}