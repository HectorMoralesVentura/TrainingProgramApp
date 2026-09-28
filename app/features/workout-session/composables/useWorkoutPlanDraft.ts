import { useQueryClient } from '@tanstack/vue-query'
import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import type { PlannedExercise, WorkoutPlan, WorkoutZone } from '~/features/workout-session/types/workout.types'

export interface DraftItem extends PlannedExercise {
  uid: string
  /** Tope por condición médica, si se conoce (cuando el ejercicio viene del catálogo). */
  max_level: ExerciseLevel | null
}

interface DraftState {
  discipline: { slug: string, name: string } | null
  zones: WorkoutZone[]
  items: DraftItem[]
}

const STORAGE_KEY = 'training_plan_draft_v1'

function load(): DraftState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Sin almacenamiento: el borrador solo vive en memoria.
  }
  return { discipline: null, zones: [], items: [] }
}

let persisting = false

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

/**
 * Borrador del plan antes de iniciar: parte de la sugerencia del backend y el usuario lo edita
 * (quitar, reordenar, cambiar nivel, agregar de otras zonas). Se guarda en sessionStorage.
 */
export function useWorkoutPlanDraft() {
  const state = useState<DraftState>('workout-plan-draft', load)
  const queryClient = useQueryClient()
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  if (import.meta.client && !persisting) {
    persisting = true
    // Scope propio: si viviera en el componente que llamó primero, dejaría de guardar al desmontarlo.
    effectScope(true).run(() => {
      watch(state, (value) => {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          // Sin almacenamiento.
        }
      }, { deep: true })
    })
  }

  const estimatedSeconds = computed(() => planDurationSeconds(state.value.items))
  const totalSets = computed(() => state.value.items.reduce((s, i) => s + i.sets, 0))

  function setFromSuggestion(discipline: { slug: string, name: string }, plan: WorkoutPlan) {
    state.value = {
      discipline,
      zones: plan.zones,
      items: plan.exercises.map(e => ({ ...e, uid: uid(), max_level: null })),
    }
  }

  function addFromCatalog(exercise: Exercise, zone: WorkoutZone, level: ExerciseLevel) {
    state.value.items.push({ ...plannedFromCatalog(exercise, zone.slug, level), uid: uid(), max_level: exercise.max_level })
    if (!state.value.zones.some(z => z.slug === zone.slug)) state.value.zones.push(zone)
  }

  function remove(itemUid: string) {
    state.value.items = state.value.items.filter(i => i.uid !== itemUid)
  }

  function move(itemUid: string, direction: -1 | 1) {
    const items = state.value.items
    const from = items.findIndex(i => i.uid === itemUid)
    const to = from + direction
    if (from < 0 || to < 0 || to >= items.length) return
    const [item] = items.splice(from, 1)
    items.splice(to, 0, item!)
  }

  /** Cambia el nivel y recalcula series/reps/descanso/peso con los datos del catálogo de la zona. */
  async function setLevel(itemUid: string, level: ExerciseLevel) {
    const item = state.value.items.find(i => i.uid === itemUid)
    const discipline = state.value.discipline?.slug
    if (!item || !discipline) return
    item.level = level
    try {
      const exercises = await queryClient.fetchQuery({
        queryKey: ['training', 'exercises', discipline, item.zone, locale.value],
        queryFn: () => $api<Exercise[]>(`/api/catalog/disciplines/${discipline}/zones/${item.zone}/exercises/`),
      })
      const catalog = exercises.find(e => e.slug === item.exercise.slug)
      if (catalog) Object.assign(item, plannedFromCatalog(catalog, item.zone, level), { uid: item.uid, max_level: catalog.max_level })
    } catch {
      // Sin datos del catálogo se conserva el nivel; el backend recalcula todo al iniciar.
    }
  }

  function clear() {
    state.value = { discipline: null, zones: [], items: [] }
  }

  return { state, estimatedSeconds, totalSets, setFromSuggestion, addFromCatalog, remove, move, setLevel, clear }
}
