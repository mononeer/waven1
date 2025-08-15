'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AchievementNotification } from '@/components/ui/achievement-notification'
import { generateSlug } from '@/lib/utils'
import Link from 'next/link'

export default function CreatePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [achievements, setAchievements] = useState<any[]>([])
  const [showAchievements, setShowAchievements] = useState(false)

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h1>
        <p className="text-gray-600 mb-6">You need to be signed in to create a post.</p>
        <Link href="/auth/signin">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      setLoading(false)
      return
    }

    try {
      const slug = generateSlug(title)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().substring(0, 200) + '...',
          slug,
          published,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Show achievements if any were unlocked
        if (data.newAchievements && data.newAchievements.length > 0) {
          setAchievements(data.newAchievements)
          setShowAchievements(true)
          // Wait a moment before redirecting to show achievements
          setTimeout(() => {
            router.push(`/post/${data.post.slug}`)
          }, 2000)
        } else {
          router.push(`/post/${data.post.slug}`)
        }
      } else {
        setError(data.error || 'Failed to create post')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showAchievements && (
        <AchievementNotification
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl wave-animation">✍️</span>
            <h1 className="text-4xl font-bold gradient-text">Create New Post</h1>
          </div>
          <p className="text-gray-600 text-lg">Share your thoughts with the Waven community</p>
        </div>

              <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-effect rounded-2xl p-8 shadow-xl border-0 space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter an engaging title for your post"
            required
            className="text-lg"
          />

          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here... You can use Markdown formatting."
            required
            rows={12}
            className="text-base"
          />

          <Textarea
            label="Excerpt (Optional)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of your post (will be auto-generated if left empty)"
            rows={3}
          />

          <Input
            label="Tags (Optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas (e.g., tech, programming, tutorial)"
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately (uncheck to save as draft)
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              onClick={() => setPublished(false)}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-wave-500 to-ocean-500 hover:from-wave-600 hover:to-ocean-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              loading={loading}
              onClick={() => setPublished(true)}
            >
              🌊 {published ? 'Publish Post' : 'Publish & Make Waves'}
            </Button>
          </div>
        </div>
      </form>

              {/* Writing Tips */}
        <div className="glass-effect rounded-2xl p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold gradient-text mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Writing Tips
          </h3>
          <div className="grid gap-3">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-lavender-50 to-lavender-100">
              <span className="text-lg">📝</span>
              <p className="text-sm text-lavender-900">Write a clear, descriptive title that captures your main idea</p>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-ocean-50 to-ocean-100">
              <span className="text-lg">📚</span>
              <p className="text-sm text-ocean-900">Structure your content with headings and paragraphs for better readability</p>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-sunset-50 to-sunset-100">
              <span className="text-lg">🏷️</span>
              <p className="text-sm text-sunset-900">Add relevant tags to help others discover your content</p>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-forest-50 to-forest-100">
              <span className="text-lg">💬</span>
              <p className="text-sm text-forest-900">Engage with your readers by asking questions or encouraging discussion</p>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-coral-50 to-coral-100">
              <span className="text-lg">✅</span>
              <p className="text-sm text-coral-900">Proofread your content before publishing</p>
            </div>
          </div>
        </div>
    </div>
    </>
  )
}