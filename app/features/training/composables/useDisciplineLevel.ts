import type { MaybeRefOrGetter } from 'vue'
import type { ExerciseLevel } from '~/features/training/types/training.types'

/**
 * Nivel del usuario en una disciplina (independiente por disciplina).
 * Lee de /api/progress/levels/ y al asignarlo hace PUT; sin registro previo se asume Principiante.
 */
export function useDisciplineLevel(disciplineSlug: MaybeRefOrGetter<string>) {
  const { data } = useDisciplineLevels()
  const { mutate } = useUpdateDisciplineLevels()

  return computed<ExerciseLevel>({
    get: () => data.value?.find(l => l.discipline === toValue(disciplineSlug))?.level ?? 'beginner',
    set: (level) => {
      mutate([{ discipline: toValue(disciplineSlug), level }])
    },
  })
}
