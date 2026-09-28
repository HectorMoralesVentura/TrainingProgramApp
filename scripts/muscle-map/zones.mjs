// Qué músculos resaltar en la imagen de cada zona (por slug del backend) y con qué vista/recorte.
// Fuente única: generate.mjs lo exporta a la app (fallback) y a public/muscles/zones/<slug>.svg.
export const ZONES = {
  'chest': { muscles: ['chest'], view: 'front', region: 'upper' },
  'back': { muscles: ['lats', 'trapezius', 'lower-back'], view: 'back', region: 'upper' },
  'biceps': { muscles: ['biceps'], view: 'front', region: 'upper' },
  'triceps': { muscles: ['triceps'], view: 'back', region: 'upper' },
  'shoulders': { muscles: ['deltoids', 'trapezius'], view: 'both', region: 'upper' },
  'abs': { muscles: ['abs', 'obliques'], view: 'front', region: 'upper' },
  'legs': { muscles: ['quadriceps', 'adductors', 'hamstrings', 'glutes', 'calves'], view: 'both', region: 'lower' },
  'quads': { muscles: ['quadriceps'], view: 'front', region: 'lower' },
  'hamstrings-glutes': { muscles: ['hamstrings', 'glutes'], view: 'back', region: 'lower' },
  'calves': { muscles: ['calves'], view: 'both', region: 'lower' },
  'upper-body': { muscles: ['chest', 'deltoids', 'biceps', 'triceps', 'lats', 'trapezius', 'forearms'], view: 'both', region: 'upper' },
  'lower-body': { muscles: ['quadriceps', 'adductors', 'hamstrings', 'glutes', 'calves'], view: 'both', region: 'lower' },
  'core': { muscles: ['abs', 'obliques', 'lower-back'], view: 'both', region: 'upper' },
  'full-body': { muscles: 'all', view: 'both', region: 'full' },
}

// Recortes del lienzo 1920x1920 (compartidos con MuscleMap.vue vía muscle-map.data.ts).
export const X_START = { front: 160, back: 1120 }
export const VIEW_WIDTH = 640
export const Y_RANGE = { full: [150, 1680], upper: [150, 910], lower: [780, 1050] }
export const VIEW_GAP = 40
