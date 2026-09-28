import type { QueryClient } from '@tanstack/vue-query'

/** Tras agregar o quitar una condición: refresca la lista del usuario y lo que filtra el catálogo. */
export function invalidateHealthDependents(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['health', 'my-conditions'] }),
    queryClient.invalidateQueries({ queryKey: ['training', 'exercises'] }),
    queryClient.invalidateQueries({ queryKey: ['training', 'zones'] }),
  ])
}
