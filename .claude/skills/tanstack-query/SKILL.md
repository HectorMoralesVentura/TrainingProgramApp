---
name: tanstack-query
description: >-
  Estandariza TanStack Query en este proyecto Nuxt: cada query o mutation vive
  en su propio composable, usa el cliente $api como base para todos los
  endpoints e interpreta cualquier fallo con parseFetchError. Aplicar al crear
  o modificar consultas GET, POST, PUT, PATCH o DELETE, composables
  useQuery/useMutation, invalidaciones y toasts de éxito o error.
---

# TanStack Query (Training Program)

Usar `@tanstack/vue-query` para todo server state.

## Organización obligatoria

- Cada consulta o mutación debe vivir en su propio composable dentro de
  `app/features/<feature>/composables/`.
- Un archivo expone una responsabilidad: por ejemplo `useTaskDetail.ts`,
  `useCreateTask.ts` o `useProjectDropdown.ts`.
- No agrupar endpoints independientes en un composable genérico.
- Componentes y páginas consumen composables; no llaman endpoints directamente.
- Mantener tipos, payloads y respuestas en
  `app/features/<feature>/types/`.

## Cliente HTTP y errores

- `$api` es el cliente configurado con la URL base de la API. Todos los
  endpoints deben ejecutarse a través de este cliente usando rutas relativas.
- Obtenerlo siempre con `const { $api } = useNuxtApp()`.
- No usar `$fetch`, `fetch` ni Axios directamente.
- Si cualquier query o mutation falla, interpretar el error exclusivamente con
  `parseFetchError` de `~/shared/utils/error-message.util`.
- No mostrar mensajes crudos de la API ni duplicar parsers locales.

## Queries

```ts
import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'

export function useTaskDetail(taskId: MaybeRefOrGetter<number | null>) {
  const { $api } = useNuxtApp()

  const query = useQuery({
    queryKey: computed(() => ['tasks', 'detail', toValue(taskId)]),
    queryFn: () => $api<TaskDetail>(`/api/tasks/${toValue(taskId)}/`),
    enabled: computed(() => toValue(taskId) != null),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
```

- La `queryKey` debe ser estable, específica y contener todos los parámetros.
- Usar `computed` y `toValue` para argumentos reactivos.
- Configurar `enabled` cuando el endpoint requiera IDs u otros datos previos.
- El composable debe interpretar `query.error.value` con `parseFetchError` y
  exponer el mensaje ya procesado cuando la UI necesite mostrarlo.

## Mutations

Toda mutación, especialmente `POST`, debe declarar `onSuccess` y `onError`.
Ambos casos deben mostrar un toast de Nuxt UI que explique claramente el
resultado.

```ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useCreateTask() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      $api('/api/tasks/create/', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.add({
        title: 'Tarea creada',
        description: 'La tarea se creó correctamente.',
        color: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'No se pudo crear la tarea',
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
```

## Invalidación

- Invalidar únicamente las familias de queries afectadas.
- Hacer la invalidación en `onSuccess`, antes o junto al toast.
- No recargar la página para refrescar server state.

## Checklist

- [ ] Cada endpoint tiene su propio composable.
- [ ] Todos los endpoints usan `$api` de `useNuxtApp()` y rutas relativas.
- [ ] La `queryKey` incluye todos los parámetros.
- [ ] Todo error de query o mutation se interpreta con `parseFetchError`.
- [ ] Toda mutación tiene `onSuccess` y `onError`.
- [ ] Los POST muestran toast de éxito y toast de error.
- [ ] `onSuccess` invalida las queries afectadas.
