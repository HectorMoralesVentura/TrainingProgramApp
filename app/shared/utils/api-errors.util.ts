import { FetchError } from 'ofetch'
import type { FormError } from '@nuxt/ui'
import type { ApiErrorBody } from '~/shared/types/api.types'

/**
 * Convierte los `errors` de un 400 del backend en errores de UForm para mostrarlos junto a cada campo.
 * Solo toma los errores planos (`campo: ["mensaje"]`); los anidados se reflejan en el `detail` del toast.
 */
export function apiFieldErrors(error: unknown): FormError[] {
  if (!(error instanceof FetchError) || error.status !== 400) return []

  const body = error.data as Partial<ApiErrorBody> | undefined
  if (!body?.errors) return []

  return Object.entries(body.errors).flatMap(([name, messages]) =>
    Array.isArray(messages) && messages.length > 0
      ? [{ name, message: String(messages[0]) }]
      : [],
  )
}
