import { z } from 'zod'

type Translate = (key: string, named?: Record<string, unknown>) => string

export function createMeasurementSchema(t: Translate, today: string) {
  const optionalCm = z.number().positive(t('progress.measurements.validation.positive')).nullable().optional()

  return z.object({
    weight_kg: z
      .number({ error: t('progress.measurements.validation.weightRequired') })
      .min(20, t('progress.measurements.validation.weightRange'))
      .max(400, t('progress.measurements.validation.weightRange')),
    measured_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, t('progress.measurements.validation.date'))
      // Comparación de cadenas AAAA-MM-DD equivale a comparar fechas.
      .refine(v => v <= today, t('progress.measurements.validation.futureDate')),
    height_cm: optionalCm,
    body_fat_pct: z.number().min(1, t('progress.measurements.validation.bodyFat')).max(75, t('progress.measurements.validation.bodyFat')).nullable().optional(),
    chest_cm: optionalCm,
    waist_cm: optionalCm,
    hip_cm: optionalCm,
    arm_cm: optionalCm,
    thigh_cm: optionalCm,
    notes: z.string().max(500),
  })
}

export type MeasurementForm = z.infer<ReturnType<typeof createMeasurementSchema>>
