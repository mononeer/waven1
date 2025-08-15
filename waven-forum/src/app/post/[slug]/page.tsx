import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { WaveButton } from '@/components/ui/wave-button'
import { 
  ChatBubbleLeftIcon, 
  EyeIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

async function getPost(slug: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerified: true,
          isAdmin: true,
          totalWaves: true,
          joinedAt: true
        }
      },
      tags: {
        include: {
          tag: true
        }
      },
      waves: userId ? {
        where: { userId },
        select: { id: true }
      } : false,
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              isVerified: true,
              isAdmin: true
            }
          },
          replies: {
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
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          waves: true,
          comments: true
        }
      }
    }
  })

  if (post) {
    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })
  }

  return post
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const post = await getPost(params.slug, session?.user?.id)

  if (!post) {
    notFound()
  }

  const userHasWaved = session ? (post.waves as any[]).length > 0 : false

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || 'Author'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {post.author.name}
                </h3>
                {post.author.isVerified && (
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                )}
                {post.author.isAdmin && (
                  <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{post.author.totalWaves} total waves</span>
                <span>•</span>
                <span>Joined {formatDate(post.author.joinedAt)}</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-6">
              <TagIcon className="w-4 h-4 text-gray-400" />
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Post Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <WaveButton
                postSlug={post.slug}
                initialWaved={userHasWaved}
                initialCount={post._count.waves}
              />
              <div className="flex items-center space-x-2 text-gray-500">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{post._count.comments}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <EyeIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{post.viewCount}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {post.updatedAt !== post.createdAt && (
                <span>Updated {formatRelativeTime(post.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({post._count.comments})
          </h2>
          
          {session ? (
            <div className="mb-8">
              <div className="flex items-start space-x-4">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'You'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Sign in to join the discussion</p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    {comment.author.image ? (
                      <img
                        src={comment.author.image}
                        alt={comment.author.name || 'Commenter'}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        {comment.author.isVerified && (
                          <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                        )}
                        {comment.author.isAdmin && (
                          <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{comment.content}</p>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Nested replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-14 mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          {reply.author.image ? (
                            <img
                              src={reply.author.image}
                              alt={reply.author.name || 'Commenter'}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {reply.author.name}
                              </span>
                              {reply.author.isVerified && (
                                <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                              )}
                              {reply.author.isAdmin && (
                                <ShieldCheckIcon className="w-3 h-3 text-purple-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-800 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}