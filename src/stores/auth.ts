import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, AuthRequest, AuthResponse } from '@/types'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userPass = ref<string | null>(localStorage.getItem('userPass'))
  const isLoading = ref(false)

  const toast = useToast()

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: AuthRequest): Promise<boolean> => {
    try {
      isLoading.value = true
      const response: AuthResponse = await api.login(credentials)
      
      if (response.resultado) {
        token.value = response.token
        refreshToken.value = response.refreshToken
        // store user password if provided in credentials
        if ((credentials as any).userPass) {
          userPass.value = (credentials as any).userPass
          if (userPass.value !== null && userPass.value !== undefined) {
            localStorage.setItem('userPass', userPass.value)
          }
        }
        
        localStorage.setItem('token', response.token)
        localStorage.setItem('refreshToken', response.refreshToken)
        
        // Get user info from API using the email provided in credentials
        try {
          const userData = await api.getUserByEmail(credentials.userEmail)
          // api.getUserByEmail may return ApiResponse or User directly
          // normalize to User
          // Normalize response: it may be User or ApiResponse<User>
          let fetchedUser: User | null = null
          if (userData && typeof userData === 'object') {
            // If backend wraps in { success, data }
            if ('data' in userData && userData.data) {
              fetchedUser = userData.data as User
            } else {
              fetchedUser = userData as User
            }
          }

          if (fetchedUser) {
            user.value = fetchedUser
            localStorage.setItem('user', JSON.stringify(fetchedUser))
          }
        } catch (userErr) {
          // If fetching user fails, clear stored user but keep tokens so frontend can handle
          console.error('Error fetching user after login:', userErr)
        }

        toast.success('¡Inicio de sesión exitoso!')
        return true
      } else {
        toast.error(response.msg || 'Error al iniciar sesión')
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  localStorage.removeItem('userPass')
    
    toast.info('Sesión cerrada')
  }

  const fetchUserInfo = async () => {
    try {
      if (!token.value) return
      const stored = localStorage.getItem('user')
      if (stored) {
        try {
          user.value = JSON.parse(stored)
        } catch (e) {
          console.error('Error parsing stored user in fetchUserInfo:', e)
          user.value = null
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  // Decode a JWT payload (no verification) to extract claims like email
  const decodeJwt = (jwt?: string): any | null => {
    if (!jwt) return null
    try {
      const parts = jwt.split('.')
      if (parts.length < 2) return null
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decodeURIComponent(escape(decoded)))
    } catch (e) {
      console.error('Failed to decode JWT', e)
      return null
    }
  }

  const refreshUser = async (email?: string) => {
    if (!email) {
      // try to decode from token
      const payload = decodeJwt(token.value || undefined)
      email = payload?.userEmail || payload?.email || email
    }

    if (!email) return null

    try {
      const userData = await api.getUserByEmail(email)
      let fetchedUser: User | null = null
      if (userData && typeof userData === 'object') {
        if ('data' in userData && userData.data) {
          fetchedUser = userData.data as User
        } else {
          fetchedUser = userData as User
        }
      }
      if (fetchedUser) {
        user.value = fetchedUser
        localStorage.setItem('user', JSON.stringify(fetchedUser))
        return fetchedUser
      }
    } catch (err) {
      console.error('refreshUser error:', err)
    }
    return null
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        logout()
      }
    }
  }


  const updateUserBalance = (pesos: number, dolares: number) => {
    if (user.value) {
      user.value.userPesos = pesos
      user.value.userDolares = dolares
      user.value.userLastUpdate = new Date().toISOString()
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const setUserPass = (pass: string | null) => {
    userPass.value = pass
    if (pass !== null && pass !== undefined) {
      localStorage.setItem('userPass', pass)
    } else {
      localStorage.removeItem('userPass')
    }
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    userPass: computed(() => userPass.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    login,
    logout,
    fetchUserInfo,
    refreshUser,
    setUserPass,
    initializeAuth,
    updateUserBalance
  }
})
