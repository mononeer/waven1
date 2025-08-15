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
    COMMON: 'from-forest-500 to-forest-600',
    RARE: 'from-wave-500 to-ocean-600',
    EPIC: 'from-lavender-500 to-lavender-600',
    LEGENDARY: 'from-sunset-400 to-sunset-600'
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`max-w-sm bg-white rounded-2xl shadow-2xl border-l-4 border-transparent bg-gradient-to-r ${rarityColors[achievement.rarity]} p-1 transform transition-all duration-500 ${
            visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
          }`}
        >
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 animated-gradient rounded-xl flex items-center justify-center shadow-lg float-animation">
                  <TrophyIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold gradient-text">
                    🎉 Achievement Unlocked!
                  </p>
                  <button
                    onClick={() => {
                      setVisible(false)
                      setTimeout(onClose, 300)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-2xl float-animation">{achievement.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-semibold text-sunset-600">+{achievement.points} points</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        achievement.rarity === 'COMMON' ? 'bg-forest-100 text-forest-800' :
                        achievement.rarity === 'RARE' ? 'bg-wave-100 text-wave-800' :
                        achievement.rarity === 'EPIC' ? 'bg-lavender-100 text-lavender-800' :
                        'bg-sunset-100 text-sunset-800'
                      }`}>
                        {achievement.rarity}
                      </span>
                    </div>
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