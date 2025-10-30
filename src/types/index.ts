// User types
export interface User {
  userId: string
  userName: string
  userEmail: string
  userPesos: number
  userDolares: number
  userLastUpdate: string
  // Additional fields from backend DTO
  userRol: string
  userEstadoId: number
  userEstadoNombre: string
  userSeleccionable: boolean
  userCodigo: string
}

// Transaction types
export interface Transaction {
  transaccionesId: number
  transaccionesUsuarioId: string
  transaccionesPesos: number
  transaccionesDolares: number
  transaccionesFecha: string
  transaccionesTipoId: number
  transaccionesDescripcion?: string
  transaccionesTipo?: TransactionType
  user?: User
}

export interface TransactionCreateRequest {
  transaccionesUsuarioId: string
  transaccionesPesos: number
  transaccionesDolares: number
  transaccionesTipoId: number
  transaccionesDescripcion?: string
  transaccionesFecha?: string
}

export interface TransactionType {
  id: number
  nombre: string
  descripcion?: string
}

// Auth types
export interface AuthRequest {
  userEmail: string
  userPass: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  resultado: boolean
  msg: string
}

export interface RefreshTokenRequest {
  tokenExpirado: string
  refreshToken: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

// Form types
export interface LoginForm {
  userName: string
  userPass: string
  userEmail: string
}

export interface RegisterForm {
  userName: string
  userEmail: string
  userPass: string
  confirmPassword: string
}

export interface TransactionForm {
  transaccionesPesos: number
  transaccionesDolares: number
  transaccionesTipoId: number
  transaccionesDescripcion?: string
}

// Wallet types
export interface WalletBalance {
  pesos: number
  dolares: number
  totalInUsd: number
}

// Transaction types enum
export enum TransactionTypes {
  DEPOSIT = 1,
  WITHDRAWAL = 2,
  TRANSFER = 3,
  EXCHANGE = 4
}
