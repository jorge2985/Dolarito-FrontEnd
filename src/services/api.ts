import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type {
  AuthRequest,
  AuthResponse,
  RefreshTokenRequest,
  User,
  TransactionCreateRequest,
  Transaction,
  ApiResponse
} from '@/types'

class ApiService {
  private api: AxiosInstance
  // In development prefer the Vite proxy (use relative '/api') so requests are forwarded to the backend
  private baseURL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api')

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      withCredentials: false // Important for CORS
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              const response = await this.obtainRefreshToken(refreshToken)
              if (response && response.token) {
                localStorage.setItem('token', response.token)
                localStorage.setItem('refreshToken', response.refreshToken)

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                originalRequest.headers.Authorization = `Bearer ${response.token}`
                return this.api(originalRequest)
              }
            } catch (refreshError) {
              this.logout()
              window.location.href = '/login'
            }
          } else {
            this.logout()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async obtainRefreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenExpirado = localStorage.getItem('token') || ''
    const res = await axios.post(`${this.baseURL}/Autenticacion/ObternerRefreshToken`, {
      tokenExpirado,
      refreshToken
    })
    return res.data
  }

  private logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Generic methods (return raw response.data)
  async get<T = any>(url: string): Promise<T> {
    const response: AxiosResponse = await this.api.get(url)
    return response.data
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse = await this.api.post(url, data)
    return response.data
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse = await this.api.put(url, data)
    return response.data
  }

  async delete<T = any>(url: string): Promise<T> {
    const response: AxiosResponse = await this.api.delete(url)
    return response.data
  }

  // Auth methods
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const res = await this.post<AuthResponse>(`/Autenticacion/Autenticar`, credentials)
    return res
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.obtainRefreshToken(refreshToken)
  }

  // User methods
  async getUsers(): Promise<User[] | ApiResponse<User[]>> {
    const res = await this.get('/Usuario/Lista')
    // Backend may return ApiResponse wrapper
    return (res && res.data) ? res.data : res
  }

  async getUserByEmail(email: string): Promise<User | ApiResponse<User>> {
    const res = await this.get(`/Usuario/ObtenerPorEmail/${email}`)
    return (res && res.data) ? res.data : res
  }

  async getUserById(id: string): Promise<User | ApiResponse<User>> {
    const res = await this.get(`/Usuario/Obtener/${id}`)
    return (res && res.data) ? res.data : res
  }

  async createUser(user: any): Promise<any> {
    try {
      // Debug: muestra la URL correcta
      // eslint-disable-next-line no-console
      console.debug('[ApiService] POST', `${this.baseURL}/Usuario/CrearCliente`, user);

      // Ruta correcta: /Usuario/CrearCliente
      const res = await this.post('/Usuario/CrearCliente', user);

      return res;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ApiService] Error al crear usuario', err);
      throw err; // o devolver un objeto con error si preferís
    }
  }

  async updateUser(id: string, user: any): Promise<any> {
    const res = await this.put(`/Usuario/ActualizarCliente/${id}`, user)
    // normalize possible ApiResponse wrapper
    return (res && res.data) ? res.data : res
  }

  async deleteUser(id: string): Promise<any> {
    const res = await this.delete(`/Usuario/Eliminar/${id}`)
    return res
  }

  // Password recovery - backend expects a raw JSON string in the body (see Swagger example)
  async recuperarPassword(payload: { userEmail: string } | string): Promise<any> {
    // Normalize to a raw string
    const emailString = typeof payload === 'string' ? payload : payload.userEmail

    // Debug info to inspect what's sent to the backend
    try {
      // eslint-disable-next-line no-console
      console.debug('[ApiService] POST', `${this.baseURL}/Usuario/RecuperarPassword`, emailString)
    } catch (e) { }

    try {
      // Send the raw string serialized as a JSON string (e.g. "user@example.com")
      const res = await this.post('/Usuario/RecuperarPassword', JSON.stringify(emailString))
      return res
    } catch (err: any) {
      // If backend returns validation message, include it in error
      // eslint-disable-next-line no-console
      console.error('[ApiService] recuperarPassword error', err?.response?.status, err?.response?.data)
      throw err
    }
  }

  // Transaction methods
  async createTransaction(transaction: TransactionCreateRequest | any): Promise<any> {
    // Normalize payload to what backend expects (userId + fields)
    const body: any = {
      // include both keys in case backend expects one or the other
      userId: transaction.userId || transaction.transaccionesUsuarioId || transaction.transaccionesUsuarioId || '',
      transaccionesUsuarioId: transaction.transaccionesUsuarioId || transaction.userId || transaction.transaccionesUsuarioId || '',
      transaccionesPesos: Number(transaction.transaccionesPesos ?? 0),
      transaccionesDolares: Number(transaction.transaccionesDolares ?? 0),
      transaccionesTipoId: Number(transaction.transaccionesTipoId ?? 0),
      transaccionesDescripcion: transaction.transaccionesDescripcion || null,
      transaccionesFecha: transaction.transaccionesFecha || new Date().toISOString()
    }

    try {
      // debug
      // eslint-disable-next-line no-console
      console.debug('[ApiService] Transacciones/Crear payload', body)
      const res = await this.post('/Transacciones/Crear', body)
      // eslint-disable-next-line no-console
      console.debug('[ApiService] Transacciones/Crear response', res)
      return res
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[ApiService] createTransaction error', err?.response?.status, err?.response?.data)
      throw err
    }
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[] | any> {
    const res = await this.get(`/Transacciones/ObtenerPorUsuarioId/${userId}`)
    // If API wraps data in { success, data }, return data
    return (res && res.data) ? res.data : res
  }

  async getTransactionById(id: number): Promise<Transaction | any> {
    const res = await this.get(`/Transacciones/${id}`)
    return (res && res.data) ? res.data : res
  }

  async updateTransaction(id: number, payload: Partial<TransactionCreateRequest>): Promise<any> {
    const res = await this.put(`/Transacciones/${id}`, payload)
    return res
  }

  async deleteTransaction(id: number): Promise<any> {
    const res = await this.delete(`/Transacciones/${id}`)
    return res
  }

  // Exchange / Rates
  async getExchangeRate(): Promise<number | any> {
    const res = await this.get('/Exchange/Rate')
    return (res && res.data) ? res.data : res
  }

  // Change password: expects payload { userId, currentPassword, newPassword }
  async changePassword(payload: { userId: string; currentPassword: string; newPassword: string }): Promise<any> {
    const res = await this.post('/Usuario/CambiarPassword', payload)
    return (res && res.data) ? res.data : res
  }

  // Wallet / Balance (best-effort: endpoint may vary)
  async getWalletBalance(userId: string): Promise<any> {
    const res = await this.get(`/Usuario/Saldo/${userId}`)
    return (res && res.data) ? res.data : res
  }
}

export default new ApiService()
