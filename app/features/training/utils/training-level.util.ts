import type { ExerciseLevel, ExerciseLevelSpec } from '~/features/training/types/training.types'

type LevelColor = 'success' | 'info' | 'warning' | 'error'

export const TRAINING_LEVELS: { value: ExerciseLevel, icon: string, color: LevelColor }[] = [
  { value: 'beginner', icon: 'i-lucide-sprout', color: 'success' },
  { value: 'intermediate', icon: 'i-lucide-flame', color: 'info' },
  { value: 'master', icon: 'i-lucide-zap', color: 'warning' },
  { value: 'legend', icon: 'i-lucide-crown', color: 'error' },
]

export function trainingLevelMeta(level: ExerciseLevel) {
  return TRAINING_LEVELS.find(l => l.value === level) ?? TRAINING_LEVELS[0]!
}

function levelIndex(level: ExerciseLevel) {
  return TRAINING_LEVELS.findIndex(l => l.value === level)
}

/** true si `level` supera el tope impuesto por una condición médica. */
export function isLevelAbove(level: ExerciseLevel, maxLevel: ExerciseLevel | null) {
  return maxLevel != null && levelIndex(level) > levelIndex(maxLevel)
}

/** Nivel elegido limitado por el tope del ejercicio. */
export function clampTrainingLevel(level: ExerciseLevel, maxLevel: ExerciseLevel | null): ExerciseLevel {
  return isLevelAbove(level, maxLevel) ? maxLevel! : level
}

export function levelSpec(levels: ExerciseLevelSpec[], level: ExerciseLevel) {
  return levels.find(l => l.level === level) ?? levels[0]!
}

/** 90 -> "1:30", 45 -> "45 s" */
export function formatTrainingSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/** Reps, tiempo de sostenimiento o "Fallo" si es hasta el fallo. */
export function formatSpecAmount(spec: ExerciseLevelSpec, toFailureLabel: string): string {
  if (spec.to_failure) return toFailureLabel
  if (spec.reps != null) return String(spec.reps)
  return formatTrainingSeconds(spec.duration_seconds ?? 0)
}

/** 32.5 -> "32.5 kg" */
export function formatWeight(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`
}
