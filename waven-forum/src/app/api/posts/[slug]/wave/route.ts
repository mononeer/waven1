import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true, authorId: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already waved this post
    const existingWave = await prisma.wave.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id
        }
      }
    })

    let waved = false
    let waveCount = 0

    if (existingWave) {
      // Remove wave
      await prisma.wave.delete({
        where: { id: existingWave.id }
      })

      // Update post wave count
      await prisma.post.update({
        where: { id: post.id },
        data: { waveCount: { decrement: 1 } }
      })

      // Update author's total waves
      await prisma.user.update({
        where: { id: post.authorId },
        data: { totalWaves: { decrement: 1 } }
      })

      waved = false
    } else {
      // Add wave
      await prisma.wave.create({
        data: {
          userId: session.user.id,
          postId: post.id
        }
      })

      // Update post wave count
      await prisma.post.update({
        where: { id: post.id },
        data: { waveCount: { increment: 1 } }
      })

      // Update author's total waves
      await prisma.user.update({
        where: { id: post.authorId },
        data: { totalWaves: { increment: 1 } }
      })

      waved = true
    }

    // Get updated wave count
    const updatedPost = await prisma.post.findUnique({
      where: { id: post.id },
      select: { waveCount: true }
    })

    waveCount = updatedPost?.waveCount || 0

    // Check for new achievements after wave action
    const [waverAchievements, authorAchievements] = await Promise.all([
      checkAndAwardAchievements(session.user.id), // For the person giving the wave
      checkAndAwardAchievements(post.authorId) // For the post author receiving waves
    ])

    const newAchievements = [...waverAchievements, ...authorAchievements]

    return NextResponse.json({
      waved,
      waveCount,
      message: waved ? 'Wave added!' : 'Wave removed',
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    })
  } catch (error) {
    console.error('Wave toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}