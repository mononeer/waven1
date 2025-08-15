import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content, excerpt, slug, published, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    })

    let finalSlug = slug
    if (existingPost) {
      // Generate a unique slug by appending a number
      let counter = 1
      while (true) {
        const newSlug = `${slug}-${counter}`
        const slugExists = await prisma.post.findUnique({
          where: { slug: newSlug }
        })
        if (!slugExists) {
          finalSlug = newSlug
          break
        }
        counter++
      }
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug: finalSlug,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            isAdmin: true
          }
        }
      }
    })

    // Create tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        if (tagName.trim()) {
          // Find or create tag
          const tagSlug = tagName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          let tag = await prisma.tag.findUnique({
            where: { slug: tagSlug }
          })

          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName.trim(),
                slug: tagSlug
              }
            })
          }

          // Link tag to post
          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id
            }
          })
        }
      }
    }

    // Check for new achievements after post creation
    const newAchievements = await checkAndAwardAchievements(session.user.id)

    return NextResponse.json(
      { 
        message: 'Post created successfully', 
        post,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    const where: any = { published: true }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    if (author) {
      where.author = {
        id: author
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
              isAdmin: true,
              totalWaves: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              waves: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}