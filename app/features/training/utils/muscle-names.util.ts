import { MUSCLE_IDS, MUSCLE_PATHS } from '~/features/training/utils/muscle-map.data'
import type { MuscleId } from '~/features/training/utils/muscle-map.data'

// La API devuelve los músculos ya traducidos ("Pectoral" / "Chest"); aquí se mapean al id del mapa.
// TODO(backend): si la API agrega el slug del músculo, usar ese y borrar este diccionario.
const ALIASES: Record<string, MuscleId | 'all'> = {
  'pectoral': 'chest', 'pecho': 'chest', 'chest': 'chest',
  'triceps': 'triceps',
  'biceps': 'biceps',
  'antebrazo': 'forearms', 'antebrazos': 'forearms', 'forearm': 'forearms', 'forearms': 'forearms',
  'hombros': 'deltoids', 'hombro': 'deltoids', 'deltoides': 'deltoids', 'shoulders': 'deltoids', 'deltoids': 'deltoids',
  'dorsales': 'lats', 'dorsal': 'lats', 'lats': 'lats',
  'trapecio': 'trapezius', 'traps': 'trapezius', 'trapezius': 'trapezius',
  'cuadriceps': 'quadriceps', 'quads': 'quadriceps', 'quadriceps': 'quadriceps',
  'isquiotibiales': 'hamstrings', 'femorales': 'hamstrings', 'hamstrings': 'hamstrings',
  'gluteos': 'glutes', 'gluteo': 'glutes', 'glutes': 'glutes',
  'pantorrillas': 'calves', 'pantorrilla': 'calves', 'gemelos': 'calves', 'calves': 'calves',
  'abdomen': 'abs', 'abdominales': 'abs', 'abs': 'abs',
  'oblicuos': 'obliques', 'obliques': 'obliques',
  'espalda baja': 'lower-back', 'lumbares': 'lower-back', 'lower back': 'lower-back',
  'aductores': 'adductors', 'adductors': 'adductors',
  'cuerpo completo': 'all', 'full body': 'all',
}

function normalize(name: string) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

const UPPER: ReadonlySet<MuscleId> = new Set<MuscleId>(['trapezius', 'deltoids', 'chest', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lats', 'lower-back'])

/**
 * Vista y recorte para resaltar un conjunto de músculos: la misma regla que usa
 * scripts/muscle-map/generate.mjs para las imágenes de ejercicio que se suben a Firebase.
 */
export function exerciseMuscleLayout(muscles: MuscleId[]) {
  if (!muscles.length) return null
  if (muscles.length === MUSCLE_IDS.length) return { muscles, view: 'both' as const, region: 'full' as const }
  const onlyFront = muscles.some(id => MUSCLE_PATHS[id].back.length === 0)
  const onlyBack = muscles.some(id => MUSCLE_PATHS[id].front.length === 0)
  const view = onlyFront && onlyBack ? 'both' as const : onlyBack ? 'back' as const : 'front' as const
  const region = muscles.every(id => UPPER.has(id)) ? 'upper' as const : muscles.every(id => !UPPER.has(id)) ? 'lower' as const : 'full' as const
  return { muscles, view, region }
}

/** Ids del mapa muscular para una lista de nombres de la API (los desconocidos se ignoran). */
export function muscleIdsFromNames(names: string[]): MuscleId[] {
  const ids = new Set<MuscleId>()
  for (const name of names) {
    const id = ALIASES[normalize(name)]
    if (id === 'all') return [...MUSCLE_IDS]
    if (id) ids.add(id)
  }
  return [...ids]
}
