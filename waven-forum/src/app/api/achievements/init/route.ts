import { NextResponse } from 'next/server'
import { initializeAchievements } from '@/lib/achievements'

export async function POST() {
  try {
    await initializeAchievements()
    return NextResponse.json({ message: 'Achievements initialized successfully' })
  } catch (error) {
    console.error('Achievement initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize achievements' },
      { status: 500 }
    )
  }
}