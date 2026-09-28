// Tipos del catálogo (snake_case de DRF, textos ya traducidos por Accept-Language).

export type ExerciseLevel = 'beginner' | 'intermediate' | 'master' | 'legend'

export interface Discipline {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  zone_count: number
}

export interface FocusZone {
  id: number
  slug: string
  name: string
  /** Ya viene topado a 6 (lo que el usuario verá). */
  exercise_count: number
  /** Imagen de la zona en Firebase Storage (FocusZone.illustration_image); null si aún no se sube. */
  illustration_url?: string | null
}

export interface ExerciseLevelSpec {
  level: ExerciseLevel
  sets: number
  /** null cuando el ejercicio es de sostenimiento (se usa duration_seconds). */
  reps: number | null
  rest_seconds: number
  duration_seconds: number | null
  to_failure: boolean
  /** Segundos de ejecución por repetición (tempo). Opcional hasta que el backend lo exponga. */
  rep_seconds?: number
  /** null = peso corporal o el usuario no ha registrado medidas. */
  suggested_weight_kg: number | null
}

export interface ExerciseMedia {
  thumbnail_url: string | null
  gif_url: string | null
  video_url: string | null
  illustration_url: string | null
}

export interface Exercise {
  id: number
  slug: string
  name: string
  /** Pasos separados por "\n". */
  instructions: string
  /** null = peso corporal. */
  equipment: string | null
  muscles: string[]
  levels: ExerciseLevelSpec[]
  media: ExerciseMedia
  /** Nivel efectivo: el del usuario limitado por max_level. */
  user_level: ExerciseLevel
  /** Tope impuesto por una condición médica; null = sin restricción. */
  max_level: ExerciseLevel | null
  suggested_weight_kg: number | null
  restriction_note: string | null
}
