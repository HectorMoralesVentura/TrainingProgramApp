import { z } from 'zod'

type Translate = (key: string, named?: Record<string, unknown>) => string

export function createWorkoutLogSchema(t: Translate) {
  const optionalNumber = z.number().nullable().optional()

  return z.object({
    perceived_effort: z.number().int().min(1, t('progress.workouts.validation.effort')).max(10, t('progress.workouts.validation.effort')).nullable().optional(),
    notes: z.string().max(500),
    sets: z.array(
      z.object({
        reps: optionalNumber.refine(v => v == null || (Number.isInteger(v) && v >= 1), t('progress.workouts.validation.reps')),
        duration_seconds: optionalNumber.refine(v => v == null || (Number.isInteger(v) && v >= 1), t('progress.workouts.validation.duration')),
        weight_kg: optionalNumber.refine(v => v == null || v >= 0, t('progress.workouts.validation.weight')),
      }).refine(
        s => s.reps != null || s.duration_seconds != null,
        { message: t('progress.workouts.validation.repsOrDuration'), path: ['reps'] },
      ),
    ).min(1, t('progress.workouts.validation.minSets')),
  })
}

export type WorkoutLogForm = z.infer<ReturnType<typeof createWorkoutLogSchema>>
