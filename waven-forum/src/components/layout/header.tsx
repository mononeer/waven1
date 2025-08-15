'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  UserIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const { data: session, status } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="glass-effect border-b border-wave-200/30 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <span className="text-white font-bold text-xl wave-animation">🌊</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text">Waven</span>
              <span className="text-xs text-wave-600 font-medium -mt-1">Make Waves</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-wave-600 font-medium transition-colors duration-200 relative group">
              <span>Home</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-wave-500 to-ocean-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/explore" className="text-gray-700 hover:text-ocean-600 font-medium transition-colors duration-200 relative group">
              <span>Explore</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-ocean-500 to-lavender-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-lavender-600 font-medium transition-colors duration-200 relative group">
              <span>Tags</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-lavender-500 to-sunset-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <>
                <Link href="/create">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-wave-500 to-ocean-500 hover:from-wave-600 hover:to-ocean-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create
                  </Button>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">
                        {session.user.name}
                      </span>
                      {session.user.isVerified && (
                        <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                      )}
                      {session.user.isAdmin && (
                        <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
                        Settings
                      </Link>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          signOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}