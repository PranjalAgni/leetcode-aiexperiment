export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: Record<string, string[]>
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  location?: string
  company?: string
  githubUrl?: string
  linkedinUrl?: string
  website?: string
}
