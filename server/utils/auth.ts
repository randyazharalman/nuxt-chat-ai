import type { H3Event } from 'h3'
import type { LogtoContext } from '@logto/nuxt'

// Extend the H3EventContext to include the logtoUser for type safety
declare module 'h3' {
  interface H3EventContext {
    logtoUser?: LogtoContext['claims']
  }
}

export interface AuthUser {
  sub: string
  email?: string
  name?: string
  username?: string
}

/**
 * Get authenticated user from event context provided by @logto/nuxt
 */
export function getAuthUser(event: H3Event): AuthUser | null {
  const user = event.context.logtoUser
  
  if (!user?.sub) {
    return null
  }
  
  return {
    sub: user.sub,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    username: user.username ?? undefined,
  }
}

/**
 * Require authentication - throws 401 if not authenticated
 */
export function requireAuth(event: H3Event): AuthUser {
  const user = getAuthUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required. Please login.'
    })
  }
  
  return user
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(event: H3Event): boolean {
  const user = getAuthUser(event)
  return !!user
}
