import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  UserIcon, 
  DocumentTextIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

async function getAdminStats() {
  const [totalUsers, totalPosts, totalWaves, totalComments, recentUsers, recentPosts] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.wave.count(),
    prisma.comment.count(),
    prisma.user.findMany({
      orderBy: { joinedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        joinedAt: true,
        isVerified: true,
        isAdmin: true,
        totalWaves: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: {
          select: {
            name: true,
            isVerified: true,
            isAdmin: true
          }
        },
        _count: {
          select: {
            waves: true,
            comments: true
          }
        }
      }
    })
  ])

  return {
    totalUsers,
    totalPosts,
    totalWaves,
    totalComments,
    recentUsers,
    recentPosts
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect('/')
  }

  const stats = await getAdminStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage your Waven community</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <HeartIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Waves</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWaves}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChatBubbleLeftIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      {user.isVerified && <CheckBadgeIcon className="w-4 h-4 text-blue-500" />}
                      {user.isAdmin && <ShieldCheckIcon className="w-4 h-4 text-purple-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatRelativeTime(user.joinedAt)}</p>
                  <p className="text-xs text-gray-400">{user._count.posts} posts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
            <Link href="/admin/posts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentPosts.map((post) => (
              <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/post/${post.slug}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                    {post.title}
                  </Link>
                  <span className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">by {post.author.name}</span>
                    {post.author.isVerified && <CheckBadgeIcon className="w-3 h-3 text-blue-500" />}
                    {post.author.isAdmin && <ShieldCheckIcon className="w-3 h-3 text-purple-500" />}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{post._count.waves} waves</span>
                    <span>{post._count.comments} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => fetch('/api/achievements/init', { method: 'POST' })}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <TrophyIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Initialize Achievements</p>
          </button>
          
          <Link href="/admin/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <UserIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Manage Users</p>
          </Link>
          
          <Link href="/admin/posts" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <DocumentTextIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Manage Posts</p>
          </Link>
        </div>
      </div>
    </div>
  )
}