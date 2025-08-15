import { prisma } from './prisma'
import { AchievementRarity } from '@prisma/client'

export interface AchievementDefinition {
  name: string
  description: string
  icon: string
  color: string
  rarity: AchievementRarity
  points: number
  condition: {
    type: 'waves_received' | 'posts_created' | 'comments_made' | 'days_active' | 'first_post' | 'first_wave'
    target?: number
    timeframe?: 'all_time' | 'monthly' | 'weekly'
  }
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // First-time achievements
  {
    name: 'Welcome Aboard',
    description: 'Created your first account on Waven',
    icon: '👋',
    color: '#10b981',
    rarity: 'COMMON',
    points: 10,
    condition: { type: 'first_post' }
  },
  {
    name: 'First Wave',
    description: 'Gave your first wave to another post',
    icon: '🌊',
    color: '#3b82f6',
    rarity: 'COMMON',
    points: 5,
    condition: { type: 'first_wave' }
  },
  {
    name: 'Author',
    description: 'Published your first post',
    icon: '✍️',
    color: '#8b5cf6',
    rarity: 'COMMON',
    points: 25,
    condition: { type: 'first_post' }
  },

  // Wave-based achievements
  {
    name: 'Wave Rider',
    description: 'Received 10 waves on your content',
    icon: '🏄',
    color: '#06b6d4',
    rarity: 'COMMON',
    points: 50,
    condition: { type: 'waves_received', target: 10 }
  },
  {
    name: 'Tsunami',
    description: 'Received 100 waves on your content',
    icon: '🌊',
    color: '#0891b2',
    rarity: 'RARE',
    points: 200,
    condition: { type: 'waves_received', target: 100 }
  },
  {
    name: 'Ocean Master',
    description: 'Received 500 waves on your content',
    icon: '🌀',
    color: '#0e7490',
    rarity: 'EPIC',
    points: 500,
    condition: { type: 'waves_received', target: 500 }
  },

  // Content creation achievements
  {
    name: 'Prolific Writer',
    description: 'Published 10 posts',
    icon: '📝',
    color: '#7c3aed',
    rarity: 'RARE',
    points: 150,
    condition: { type: 'posts_created', target: 10 }
  },
  {
    name: 'Content Creator',
    description: 'Published 50 posts',
    icon: '🎯',
    color: '#6d28d9',
    rarity: 'EPIC',
    points: 750,
    condition: { type: 'posts_created', target: 50 }
  },
  {
    name: 'Waven Legend',
    description: 'Published 100 posts',
    icon: '👑',
    color: '#fbbf24',
    rarity: 'LEGENDARY',
    points: 1500,
    condition: { type: 'posts_created', target: 100 }
  },

  // Engagement achievements
  {
    name: 'Conversationalist',
    description: 'Made 25 comments',
    icon: '💬',
    color: '#f59e0b',
    rarity: 'COMMON',
    points: 75,
    condition: { type: 'comments_made', target: 25 }
  },
  {
    name: 'Community Voice',
    description: 'Made 100 comments',
    icon: '🗣️',
    color: '#d97706',
    rarity: 'RARE',
    points: 250,
    condition: { type: 'comments_made', target: 100 }
  }
]

export async function initializeAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        rarity: achievement.rarity,
        points: achievement.points,
        condition: JSON.stringify(achievement.condition)
      },
      create: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        rarity: achievement.rarity,
        points: achievement.points,
        condition: JSON.stringify(achievement.condition)
      }
    })
  }
}

export async function checkAndAwardAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: { where: { published: true } },
      waves: true,
      comments: true,
      achievements: { include: { achievement: true } }
    }
  })

  if (!user) return []

  const existingAchievements = new Set(
    user.achievements.map(ua => ua.achievement.name)
  )

  const newAchievements = []

  for (const achievementDef of ACHIEVEMENTS) {
    if (existingAchievements.has(achievementDef.name)) continue

    let shouldAward = false

    switch (achievementDef.condition.type) {
      case 'waves_received':
        shouldAward = user.totalWaves >= (achievementDef.condition.target || 0)
        break
      case 'posts_created':
        shouldAward = user.posts.length >= (achievementDef.condition.target || 0)
        break
      case 'comments_made':
        shouldAward = user.comments.length >= (achievementDef.condition.target || 0)
        break
      case 'first_post':
        shouldAward = user.posts.length >= 1
        break
      case 'first_wave':
        shouldAward = user.waves.length >= 1
        break
    }

    if (shouldAward) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: achievementDef.name }
      })

      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }
  }

  return newAchievements
}