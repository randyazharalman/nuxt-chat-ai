export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server side
  if (process.server) return

  try {
    // Check if user is authenticated
    const response = await $fetch('/api/auth/user')
    
    if (!response) {
      return window.location.href = '/login'
    }
  } catch (error) {
    // If auth check fails, redirect to login
    return window.location.href = '/login'
  }
})