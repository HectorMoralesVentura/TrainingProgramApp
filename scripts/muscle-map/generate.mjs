// Genera el mapa muscular a partir de shapes.mjs:
//   - app/features/training/utils/muscle-map.data.ts  (paths para el componente MuscleMap)
//   - public/muscles/<musculo>.svg                     (una capa por músculo, 1920x1920)
//   - public/muscles/body.svg                          (silueta)
//   - public/muscles/zones/<zona>.svg                  (imagen de cada zona para FocusZone.illustration_image)
//   - public/muscles/exercises/<ejercicio>.svg         (imagen de cada ejercicio, a partir de exercises.json)
// Los PNG se exportan con export-png.mjs (necesita un navegador).
//
// Uso: node scripts/muscle-map/generate.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BACK_OFFSET, BODY, CANVAS, FRONT_AXIS, MUSCLES } from './shapes.mjs'
import { VIEW_GAP, VIEW_WIDTH, X_START, Y_RANGE, ZONES } from './zones.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const MUSCLE_COLOR = '#5B8CFF'
const BODY_COLOR = '#E5E7EB'

const r = n => Math.round(n * 10) / 10

/** Curva cerrada suave que pasa por todos los puntos (Catmull-Rom -> Bézier cúbica). */
function smoothClosedPath(points) {
  const n = points.length
  let d = `M${r(points[0][0])} ${r(points[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`
  }
  return `${d}Z`
}

const mirror = (points, axis) => points.map(([x, y]) => [2 * axis - x, y])
const shift = (points, dx) => points.map(([x, y]) => [x + dx, y])

/** Media forma (de la línea media superior a la inferior) -> forma completa simétrica. */
function fromHalf(half, axis) {
  const other = mirror(half, axis).reverse().slice(1, -1)
  return [...half, ...other]
}

function ellipsePath([cx, cy, rx, ry]) {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`
}

/** Paths de una forma para una vista (reflejo incluido). */
function shapePaths(shape, view) {
  const dx = view === 'back' ? BACK_OFFSET : 0
  const axis = FRONT_AXIS + dx
  if (!Array.isArray(shape) && shape.half) {
    return [smoothClosedPath(fromHalf(shift(shape.points, dx), axis))]
  }
  const left = shift(shape, dx)
  return [smoothClosedPath(left), smoothClosedPath(mirror(left, axis))]
}

// ---- Silueta ----
const bodyPaths = []
for (const view of ['front', 'back']) {
  const dx = view === 'back' ? BACK_OFFSET : 0
  const axis = FRONT_AXIS + dx
  const [cx, cy, rx, ry] = BODY.head.ellipse
  bodyPaths.push(ellipsePath([cx + dx, cy, rx, ry]))
  bodyPaths.push(`M${shift(BODY.neck, dx).map(p => p.join(' ')).join('L')}Z`)
  bodyPaths.push(smoothClosedPath(fromHalf(shift(BODY.torsoHalf, dx), axis)))
  for (const part of [BODY.arm, BODY.leg]) {
    const left = shift(part, dx)
    bodyPaths.push(smoothClosedPath(left), smoothClosedPath(mirror(left, axis)))
  }
}

// ---- Músculos ----
const musclePaths = {}
for (const [id, views] of Object.entries(MUSCLES)) {
  musclePaths[id] = { front: [], back: [] }
  for (const view of ['front', 'back']) {
    for (const shape of views[view] ?? []) musclePaths[id][view].push(...shapePaths(shape, view))
  }
}

// ---- Salidas ----
const svg = (content, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}"><title>${title}</title>${content}</svg>\n`

const outDir = resolve(root, 'public/muscles')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'body.svg'), svg(`<g fill="${BODY_COLOR}">${bodyPaths.map(d => `<path d="${d}"/>`).join('')}</g>`, 'body'))
for (const [id, views] of Object.entries(musclePaths)) {
  const paths = [...views.front, ...views.back].map(d => `<path d="${d}"/>`).join('')
  writeFileSync(resolve(outDir, `${id}.svg`), svg(`<g fill="${MUSCLE_COLOR}">${paths}</g>`, id))
}

// ---- Imagen por zona (se sube a Firebase y se guarda en FocusZone.illustration_image) ----
// Colores neutros semitransparentes: la misma imagen se ve bien sobre fondo claro y oscuro.
const ZONE_HIGHLIGHT = '#14B8A6'
const ZONE_GRAY = '#9CA3AF'
const ids = Object.keys(musclePaths)

/** Imagen compuesta: silueta + músculos (resaltados en teal) en una o dos vistas lado a lado. */
function compositeSvg(title, activeIds, view, region) {
  const active = new Set(activeIds)
  const sides = view === 'both' ? ['front', 'back'] : [view]
  const [y, height] = Y_RANGE[region]
  const width = sides.length * VIEW_WIDTH + (sides.length - 1) * VIEW_GAP
  const views = sides.map((side, i) => {
    const muscles = ids.map((id) => {
      const fill = active.has(id) ? `fill="${ZONE_HIGHLIGHT}"` : `fill="${ZONE_GRAY}" fill-opacity="0.5"`
      return `<g ${fill}>${musclePaths[id][side].map(d => `<path d="${d}"/>`).join('')}</g>`
    }).join('')
    return `<svg x="${i * (VIEW_WIDTH + VIEW_GAP)}" y="0" width="${VIEW_WIDTH}" height="${height}" viewBox="${X_START[side]} ${y} ${VIEW_WIDTH} ${height}">`
      + `<g fill="${ZONE_GRAY}" fill-opacity="0.28">${bodyPaths.map(d => `<path d="${d}"/>`).join('')}</g>${muscles}</svg>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${title}</title>${views}</svg>\n`
}

const zoneDir = resolve(outDir, 'zones')
mkdirSync(zoneDir, { recursive: true })
for (const [slug, zone] of Object.entries(ZONES)) {
  writeFileSync(resolve(zoneDir, `${slug}.svg`), compositeSvg(slug, zone.muscles === 'all' ? ids : zone.muscles, zone.view, zone.region))
}

// ---- Imagen por ejercicio (ExerciseMedia "illustration") ----
// exercises.json = [{ slug, muscles: [slugs del backend] }], exportado de la base de datos.
const BACKEND_MUSCLES = { quads: 'quadriceps', shoulders: 'deltoids', traps: 'trapezius', forearm: 'forearms' }
const UPPER = new Set(['trapezius', 'deltoids', 'chest', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lats', 'lower-back'])

function exerciseLayout(muscleIds) {
  const onlyFront = muscleIds.some(id => musclePaths[id].back.length === 0)
  const onlyBack = muscleIds.some(id => musclePaths[id].front.length === 0)
  const view = onlyFront && onlyBack ? 'both' : onlyBack ? 'back' : 'front'
  const allUpper = muscleIds.every(id => UPPER.has(id))
  const allLower = muscleIds.every(id => !UPPER.has(id))
  return { view, region: allUpper ? 'upper' : allLower ? 'lower' : 'full' }
}

const exercises = JSON.parse(readFileSync(resolve(root, 'scripts/muscle-map/exercises.json'), 'utf8'))
const exerciseDir = resolve(outDir, 'exercises')
mkdirSync(exerciseDir, { recursive: true })
const unknown = new Set()
for (const { slug, muscles } of exercises) {
  const full = muscles.includes('full-body')
  const muscleIds = full
    ? ids
    : [...new Set(muscles.map(m => BACKEND_MUSCLES[m] ?? m).filter((id) => {
        if (musclePaths[id]) return true
        unknown.add(id)
        return false
      }))]
  if (!muscleIds.length) continue
  const { view, region } = full ? { view: 'both', region: 'full' } : exerciseLayout(muscleIds)
  writeFileSync(resolve(exerciseDir, `${slug}.svg`), compositeSvg(slug, muscleIds, view, region))
}
if (unknown.size) console.warn(`Músculos del backend sin forma en el mapa: ${[...unknown].join(', ')}`)
console.log(`Imágenes: ${Object.keys(ZONES).length} zonas, ${exercises.length} ejercicios`)

const ts = `// Archivo generado por scripts/muscle-map/generate.mjs. No editar a mano: cambia shapes.mjs / zones.mjs y regenera.

export const MUSCLE_IDS = ${JSON.stringify(ids)} as const

export type MuscleId = typeof MUSCLE_IDS[number]

export const MUSCLE_CANVAS = ${CANVAS}

export const BODY_PATHS: string[] = ${JSON.stringify(bodyPaths)}

export const MUSCLE_PATHS: Record<MuscleId, { front: string[], back: string[] }> = ${JSON.stringify(musclePaths)}

export type MuscleView = 'front' | 'back'
export type MuscleRegion = 'full' | 'upper' | 'lower'

export const MUSCLE_X_START: Record<MuscleView, number> = ${JSON.stringify(X_START)}
export const MUSCLE_VIEW_WIDTH = ${VIEW_WIDTH}
export const MUSCLE_Y_RANGE: Record<MuscleRegion, [number, number]> = ${JSON.stringify(Y_RANGE)}

export const ZONE_MUSCLES: Record<string, { muscles: MuscleId[] | 'all', view: MuscleView | 'both', region: MuscleRegion }> = ${JSON.stringify(ZONES)}
`
writeFileSync(resolve(root, 'app/features/training/utils/muscle-map.data.ts'), ts)

console.log(`Generados ${ids.length} músculos: ${ids.join(', ')}`)
