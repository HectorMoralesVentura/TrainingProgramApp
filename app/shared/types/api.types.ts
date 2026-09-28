/** Respuesta paginada de DRF (historiales). */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Forma de error del backend: `detail` siempre es string; `errors` trae los mensajes por campo en 400. */
export interface ApiErrorBody {
  code: string
  detail: string
  errors: Record<string, string[] | Record<string, unknown>>
}

export const API_PAGE_SIZE = 20
