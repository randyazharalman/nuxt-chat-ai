export interface User {
  id: string
  logtoId: string
  email?: string | null
  createdAt: Date
}

export interface AuthContext {
  isAuthenticated: boolean
  user: User | null
  claims? : any
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = useState('auth-loading', () => false)

  const checkAuth = async (): Promise<boolean> => {
    if (user.value) return true

    isLoading.value = true
    try {
      const data = await $fetch<User>('/api/auth/user')
      console.log(data)
      user.value = data
      return true
    } catch (error) {
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signIn = () => {
    navigateTo('/login')
  }

  const signOut = () => {
    user.value = null
    navigateTo('/sign-out')
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    checkAuth,
    signIn,
    signOut,
  }
}