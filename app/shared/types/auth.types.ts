export interface AuthUser {
  id: number
  username: string
  is_superuser: boolean
}

export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthLoginResponse {
  token: string
  user?: AuthUser
  username?: string
}

export interface AuthSession {
  token: string
  username: string
  user: AuthUser | null
}
