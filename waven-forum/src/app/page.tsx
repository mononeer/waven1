import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import { WaveButton } from '@/components/ui/wave-button'
import { 
  ChatBubbleLeftIcon, 
  EyeIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline'

async function getPosts(userId?: string) {
  const posts = await prisma.post.findMany({
    where: { published: true },
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
      waves: userId ? {
        where: { userId },
        select: { id: true }
      } : false,
      _count: {
        select: {
          waves: true,
          comments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  return posts
}

async function getStats() {
  const [totalPosts, totalUsers, totalWaves] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.wave.count()
  ])
  
  return { totalPosts, totalUsers, totalWaves }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const [posts, stats] = await Promise.all([getPosts(session?.user?.id), getStats()])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome to Waven</h1>
            <p className="text-blue-100 mb-4">
              Share your ideas, get waves, and join the conversation. Create your first post and start making waves in the community!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create Your First Post
            </Link>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share something amazing!</p>
                <Link
                  href="/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create First Post
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    {post.author.image ? (
                      <img
                        src={post.author.image}
                        alt={post.author.name || 'Author'}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {post.author.name?.[0] || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {post.author.name}
                        </span>
                        {post.author.isVerified && (
                          <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                        )}
                        {post.author.isAdmin && (
                          <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span>•</span>
                        <span>{post.author.totalWaves} waves total</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/post/${post.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <WaveButton
                        postSlug={post.slug}
                        initialWaved={session ? (post.waves as any[]).length > 0 : false}
                        initialCount={post._count.waves}
                      />
                      <Link
                        href={`/post/${post.slug}#comments`}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{post._count.comments}</span>
                      </Link>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <EyeIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.viewCount}</span>
                      </div>
                    </div>
                    <Link
                      href={`/post/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Community Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-bold text-gray-900">{stats.totalPosts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Community Members</span>
                <span className="font-bold text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Waves</span>
                <span className="font-bold text-gray-900">{stats.totalWaves}</span>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Create your first post</p>
                  <p className="text-xs text-gray-500">Share your thoughts with the community</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Give waves to great content</p>
                  <p className="text-xs text-gray-500">Show appreciation for posts you love</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Engage in discussions</p>
                  <p className="text-xs text-gray-500">Join conversations and make connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
