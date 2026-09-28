export interface AuthUser {
  id: number
  username: string
  is_superuser: boolean
  email?: string
  /** URL firmada de la foto de perfil (Firebase Storage); null si no tiene. */
  photo_url?: string | null
}

export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthFirebaseRequest {
  id_token: string
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
