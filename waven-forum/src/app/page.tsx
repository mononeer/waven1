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
  TrophyIcon,
  PlusIcon
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
          <div className="animated-gradient rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl wave-animation">🌊</span>
                <h1 className="text-4xl font-bold">Welcome to Waven</h1>
              </div>
              <p className="text-white/90 mb-6 text-lg">
                Share your ideas, get waves, and join the conversation. Create your first post and start making waves in the community!
              </p>
              <Link
                href="/create"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Post
              </Link>
            </div>
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
                <article key={post.id} className="glass-effect rounded-2xl p-6 card-hover wave-glow border-0 shadow-lg">
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
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-transparent hover:bg-gradient-to-r hover:from-wave-600 hover:to-ocean-600 hover:bg-clip-text transition-all duration-300">
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
                      className="text-wave-600 hover:text-wave-700 font-semibold text-sm bg-gradient-to-r from-wave-500 to-ocean-500 bg-clip-text hover:from-wave-600 hover:to-ocean-600 transition-all duration-300"
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
          <div className="glass-effect rounded-2xl p-6 shadow-lg border-0">
            <h3 className="text-lg font-bold gradient-text mb-6 flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2 text-sunset-500 float-animation" />
              Community Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-wave-50 to-wave-100 border border-wave-200">
                <span className="text-wave-700 font-medium">Total Posts</span>
                <span className="font-bold text-wave-900 text-lg">{stats.totalPosts}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-forest-50 to-forest-100 border border-forest-200">
                <span className="text-forest-700 font-medium">Community Members</span>
                <span className="font-bold text-forest-900 text-lg">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-ocean-50 to-ocean-100 border border-ocean-200">
                <span className="text-ocean-700 font-medium">Total Waves</span>
                <span className="font-bold text-ocean-900 text-lg flex items-center">
                  <span className="mr-1">🌊</span>
                  {stats.totalWaves}
                </span>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="glass-effect rounded-2xl p-6 shadow-lg border-0">
            <h3 className="text-lg font-bold gradient-text mb-6">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-lavender-50 to-lavender-100 border border-lavender-200">
                <div className="w-8 h-8 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 shadow-lg">
                  ✍️
                </div>
                <div>
                  <p className="text-sm text-lavender-900 font-semibold">Create your first post</p>
                  <p className="text-xs text-lavender-600">Share your thoughts with the community</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-coral-50 to-coral-100 border border-coral-200">
                <div className="w-8 h-8 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 shadow-lg">
                  🌊
                </div>
                <div>
                  <p className="text-sm text-coral-900 font-semibold">Give waves to great content</p>
                  <p className="text-xs text-coral-600">Show appreciation for posts you love</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-sunset-50 to-sunset-100 border border-sunset-200">
                <div className="w-8 h-8 bg-gradient-to-r from-sunset-500 to-sunset-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 shadow-lg">
                  💬
                </div>
                <div>
                  <p className="text-sm text-sunset-900 font-semibold">Engage in discussions</p>
                  <p className="text-xs text-sunset-600">Join conversations and make connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
