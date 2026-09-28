import type { Exercise, ExerciseLevel, ExerciseMedia } from '~/features/training/types/training.types'

export type WorkoutStatus = 'in_progress' | 'completed' | 'cancelled'

export interface WorkoutZone {
  slug: string
  name: string
}

export interface WorkoutSetDone {
  id: number
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  /** Descanso real tomado antes de esta serie. */
  rest_seconds: number | null
  performed_at: string
}

/** Ejercicio del plan (misma forma en la sugerencia y en el entrenamiento en curso). */
export interface PlannedExercise {
  /** ExerciseLog id; null en la sugerencia. */
  id: number | null
  order: number
  exercise: Pick<Exercise, 'id' | 'slug' | 'name' | 'instructions' | 'equipment' | 'muscles'> & { media: ExerciseMedia }
  zone: string
  level: ExerciseLevel
  sets: number
  /** null = sostenimiento (usa duration_seconds). */
  reps: number | null
  duration_seconds: number | null
  to_failure: boolean
  rest_seconds: number
  /** Segundos por repetición. */
  execution_time_seconds: number
  work_seconds_per_set: number
  estimated_seconds: number
  suggested_weight_kg: number | null
  restriction_note: string | null
  sets_done: WorkoutSetDone[]
  completed: boolean
}

export interface WorkoutPlan {
  discipline: string
  zones: WorkoutZone[]
  estimated_duration_seconds: number
  exercises: PlannedExercise[]
}

export interface Workout {
  id: number
  discipline: string
  status: WorkoutStatus
  zones: WorkoutZone[]
  started_at: string
  ended_at: string | null
  estimated_duration_seconds: number
  perceived_effort: number | null
  notes: string
  exercises: PlannedExercise[]
}

export interface WorkoutSuggestPayload {
  discipline: string
  zones: string[]
  exercises_per_zone?: number
}

export interface WorkoutStartPayload {
  discipline: string
  exercises?: { exercise: string, level?: ExerciseLevel }[]
  zones?: string[]
  exercises_per_zone?: number
}

export interface LogSetPayload {
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  rest_seconds: number | null
}

export interface WorkoutReportExercise {
  id: number
  exercise: { id: number, slug: string, name: string }
  zone: string
  level: ExerciseLevel
  planned: { sets: number, reps: number | null, duration_seconds: number | null, rest_seconds: number, to_failure: boolean, estimated_seconds: number }
  suggested_weight_kg: number | null
  sets_done: number
  sets_planned: number
  reps_done: number
  volume_kg: number
  max_weight_kg: number | null
  work_seconds: number
  rest_seconds: number
  completed: boolean
}

export interface WorkoutReport {
  id: number
  discipline: string
  status: WorkoutStatus
  started_at: string
  ended_at: string | null
  duration_seconds: number
  estimated_duration_seconds: number
  perceived_effort: number | null
  notes: string
  totals: {
    exercises: number
    exercises_completed: number
    sets_planned: number
    sets_done: number
    reps_done: number
    volume_kg: number
    work_seconds: number
    rest_seconds: number
    completion_pct: number
  }
  zones: (WorkoutZone & { exercises: number, sets_done: number, reps_done: number, volume_kg: number })[]
  exercises: WorkoutReportExercise[]
}

export interface WorkoutSummary {
  totals: { sessions: number, duration_seconds: number, sets_done: number, reps_done: number, volume_kg: number }
  zones: (WorkoutZone & { sessions: number, sets_done: number, volume_kg: number })[]
  top_exercises: { slug: string, name: string, times: number, sets_done: number, best_weight_kg: number | null }[]
}

export interface WorkoutSummaryFilters {
  discipline?: string
  date_from?: string
  date_to?: string
}
