import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { WaveButton } from '@/components/ui/wave-button'
import { 
  UserIcon, 
  CalendarIcon, 
  HeartIcon, 
  DocumentTextIcon,
  TrophyIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ChatBubbleLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        where: { published: true },
        include: {
          _count: {
            select: {
              waves: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      achievements: {
        include: {
          achievement: true
        },
        orderBy: { unlockedAt: 'desc' }
      },
      _count: {
        select: {
          posts: { where: { published: true } },
          waves: true,
          comments: true
        }
      }
    }
  })

  return user
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await getUserProfile(session.user.id)

  if (!user) {
    redirect('/')
  }

  const totalPoints = user.achievements.reduce((sum, ua) => sum + ua.achievement.points, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center space-x-6 mb-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-gray-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              {user.isVerified && (
                <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
              )}
              {user.isAdmin && (
                <ShieldCheckIcon className="w-6 h-6 text-purple-500" />
              )}
            </div>
            <p className="text-gray-600 mb-3">{user.email}</p>
            {user.bio && (
              <p className="text-gray-800 mb-3">{user.bio}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {formatDate(user.joinedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrophyIcon className="w-4 h-4" />
                <span>{totalPoints} points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DocumentTextIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{user._count.posts}</p>
            <p className="text-sm text-blue-600">Posts</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <HeartIcon className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">{user.totalWaves}</p>
            <p className="text-sm text-red-600">Waves Received</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <ChatBubbleLeftIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{user._count.comments}</p>
            <p className="text-sm text-green-600">Comments</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <TrophyIcon className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{user.achievements.length}</p>
            <p className="text-sm text-yellow-600">Achievements</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Posts</h2>
              <Link href="/create" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Create New →
              </Link>
            </div>
            
            {user.posts.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Share your thoughts with the community!</p>
                <Link
                  href="/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <Link href={`/post/${post.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 mb-2">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{post._count.waves}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{post._count.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{post.viewCount}</span>
                        </div>
                      </div>
                      <span className="text-gray-500">{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
          
          {user.achievements.length === 0 ? (
            <div className="text-center py-8">
              <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No achievements yet. Start posting and engaging to unlock your first achievement!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.achievements.map((userAchievement) => {
                const achievement = userAchievement.achievement
                const rarityColors = {
                  COMMON: 'bg-gray-100 text-gray-800',
                  RARE: 'bg-blue-100 text-blue-800',
                  EPIC: 'bg-purple-100 text-purple-800',
                  LEGENDARY: 'bg-yellow-100 text-yellow-800'
                }
                
                return (
                  <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${rarityColors[achievement.rarity]}`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{achievement.points} points</span>
                          <span>Unlocked {formatRelativeTime(userAchievement.unlockedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}