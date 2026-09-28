import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import type { PlannedExercise } from '~/features/workout-session/types/workout.types'

/** Cuenta regresiva antes de la primera serie. */
export const PREPARE_SECONDS = 5
/** Segundos por repetición si el catálogo no trae `rep_seconds` (el backend usa el mismo valor). */
export const DEFAULT_REP_SECONDS = 4
/** Referencia para series "hasta el fallo" (el usuario termina con "Serie hecha"). */
export const TO_FAILURE_SECONDS = 45
/** Lo que suma el botón "+15 s". */
export const EXTRA_SECONDS = 15

export function isHoldExercise(p: Pick<PlannedExercise, 'reps' | 'to_failure'>) {
  return p.reps == null && !p.to_failure
}

/** Tiempo de trabajo de una serie: sostenimiento = duración; reps = reps × segundos por rep. */
export function workSecondsFor(p: Pick<PlannedExercise, 'reps' | 'to_failure' | 'duration_seconds' | 'work_seconds_per_set'>) {
  if (p.reps == null && !p.to_failure && p.duration_seconds != null) return p.duration_seconds
  return p.work_seconds_per_set
}

/**
 * Ejercicio del catálogo -> ejercicio del plan (para agregar o cambiar nivel antes de iniciar).
 * Las estimaciones siguen la regla del backend; al iniciar, el backend devuelve los valores definitivos.
 */
export function plannedFromCatalog(exercise: Exercise, zone: string, level: ExerciseLevel): PlannedExercise {
  const effective = clampTrainingLevel(level, exercise.max_level)
  const spec = levelSpec(exercise.levels, effective)
  const repSeconds = spec.rep_seconds ?? DEFAULT_REP_SECONDS
  const work = spec.reps == null && !spec.to_failure
    ? spec.duration_seconds ?? 0
    : spec.to_failure ? TO_FAILURE_SECONDS : (spec.reps ?? 0) * repSeconds
  return {
    id: null,
    order: 0,
    exercise: {
      id: exercise.id,
      slug: exercise.slug,
      name: exercise.name,
      instructions: exercise.instructions,
      equipment: exercise.equipment,
      muscles: exercise.muscles,
      media: exercise.media,
    },
    zone,
    level: effective,
    sets: spec.sets,
    reps: spec.reps,
    duration_seconds: spec.duration_seconds,
    to_failure: spec.to_failure,
    rest_seconds: spec.rest_seconds,
    execution_time_seconds: repSeconds,
    work_seconds_per_set: work,
    estimated_seconds: spec.sets * work + Math.max(0, spec.sets - 1) * spec.rest_seconds,
    suggested_weight_kg: exercise.equipment ? spec.suggested_weight_kg : null,
    restriction_note: exercise.restriction_note,
    sets_done: [],
    completed: false,
  }
}

/** Duración total de un plan: ejercicios + descansos entre ellos. */
export function planDurationSeconds(items: Pick<PlannedExercise, 'estimated_seconds' | 'rest_seconds'>[]) {
  if (!items.length) return 0
  return items.reduce((s, i) => s + i.estimated_seconds, 0) + items.slice(0, -1).reduce((s, i) => s + i.rest_seconds, 0)
}

/** 75 -> "1:15", 3725 -> "1:02:05" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** 3725 -> "1 h 2 min", 150 -> "3 min" (redondeo para estimaciones). */
export function formatDuration(totalSeconds: number, t: (key: string, named?: Record<string, unknown>) => string): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  if (minutes < 60) return t('session.time.minutes', { n: minutes })
  return t('session.time.hoursMinutes', { h: Math.floor(minutes / 60), m: minutes % 60 })
}
