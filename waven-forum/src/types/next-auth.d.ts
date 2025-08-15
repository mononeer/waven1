import 'next-auth'

declare module 'next-auth' {
  interface User {
    isVerified?: boolean
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      isVerified?: boolean
      isAdmin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isVerified?: boolean
    isAdmin?: boolean
  }
}