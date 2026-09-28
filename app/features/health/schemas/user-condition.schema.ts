import { z } from 'zod'

type Translate = (key: string, named?: Record<string, unknown>) => string

export function createUserConditionSchema(t: Translate, today: string) {
  return z.object({
    condition: z.string({ error: t('health.validation.condition') }).min(1, t('health.validation.condition')),
    severity: z.enum(['mild', 'moderate', 'severe']),
    started_at: z
      .string()
      .refine(v => v === '' || v <= today, t('health.validation.futureDate')),
    notes: z.string().max(500),
    affected_zones: z.array(z.number()),
  })
}

export type UserConditionForm = z.infer<ReturnType<typeof createUserConditionSchema>>
