import type { ExerciseLevel } from '~/features/training/types/training.types'

export interface DisciplineLevel {
  discipline: string
  level: ExerciseLevel
}

export interface Measurement {
  id: number
  measured_at: string
  weight_kg: number
  height_cm: number | null
  body_fat_pct: number | null
  chest_cm: number | null
  waist_cm: number | null
  hip_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  notes: string
}

export type MeasurementPayload = Partial<Omit<Measurement, 'id' | 'weight_kg'>> & { weight_kg: number }

export interface WorkoutSet {
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
}

export interface WorkoutSetPayload {
  set_number: number
  reps?: number
  weight_kg?: number
  duration_seconds?: number
}

export interface WorkoutExerciseLog {
  id: number
  exercise: { id: number, slug: string, name: string }
  level: ExerciseLevel
  suggested_weight_kg: number | null
  notes: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: number
  discipline: string
  started_at: string
  ended_at: string | null
  perceived_effort: number | null
  notes: string
  exercises: WorkoutExerciseLog[]
}

export interface WorkoutPayload {
  discipline: string
  started_at?: string
  ended_at?: string
  perceived_effort?: number
  notes?: string
  exercises: {
    exercise: string
    level: ExerciseLevel
    notes?: string
    sets: WorkoutSetPayload[]
  }[]
}

export interface ProgressPhoto {
  id: number
  /** URL firmada de Firebase Storage (caduca). */
  url: string
  taken_at: string
  note: string
  created_at: string
}

export interface ProgressPhotoPayload {
  file: File
  taken_at?: string
  note?: string
}

export interface WorkoutFilters {
  discipline?: string
  date_from?: string
  date_to?: string
  page: number
}
