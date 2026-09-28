/**
 * prepare = cuenta regresiva inicial; work = ejecución; log = capturar reps/peso de la serie;
 * rest = descanso. El temporizador vive en el cliente (localStorage) y se asocia al id del entrenamiento:
 * si el usuario recarga, se retoma la misma fase; con otro entrenamiento se reinicia.
 */
export type TimerPhase = 'prepare' | 'work' | 'log' | 'rest'

interface TimerState {
  workoutId: number | null
  /** ExerciseLog en el que está el usuario. */
  logId: number | null
  phase: TimerPhase
  phaseStartedAt: number | null
  phaseSeconds: number
  pausedAt: number | null
  phasePausedMs: number
  /** Duración real de la última ejecución (para prellenar la captura). */
  lastWorkSeconds: number
  /** Descanso real medido, pendiente de enviarse con la siguiente serie. */
  pendingRestSeconds: number | null
  /** Ejercicios que el usuario saltó en este entrenamiento. */
  skipped: number[]
}

const STORAGE_KEY = 'training_timer_v1'

function emptyTimer(): TimerState {
  return {
    workoutId: null,
    logId: null,
    phase: 'prepare',
    phaseStartedAt: null,
    phaseSeconds: 0,
    pausedAt: null,
    phasePausedMs: 0,
    lastWorkSeconds: 0,
    pendingRestSeconds: null,
    skipped: [],
  }
}

function load(): TimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyTimer(), ...JSON.parse(raw) } : emptyTimer()
  } catch {
    return emptyTimer()
  }
}

let persisting = false

export function useWorkoutTimer() {
  const timer = useState<TimerState>('workout-timer', load)

  if (import.meta.client && !persisting) {
    persisting = true
    // Scope propio: el guardado no debe depender del componente que llamó primero.
    effectScope(true).run(() => {
      watch(timer, (value) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          // Sin almacenamiento: el temporizador solo vive en memoria.
        }
      }, { deep: true })
    })
  }

  const isPaused = computed(() => timer.value.pausedAt != null)

  /** Asocia el temporizador a un entrenamiento; si es otro, empieza con la preparación. */
  function attach(workoutId: number) {
    if (timer.value.workoutId === workoutId) return
    timer.value = { ...emptyTimer(), workoutId }
    enter('prepare', PREPARE_SECONDS)
  }

  function enter(phase: TimerPhase, seconds: number, at = Date.now()) {
    timer.value.phase = phase
    timer.value.phaseStartedAt = at
    timer.value.phaseSeconds = seconds
    timer.value.phasePausedMs = 0
    timer.value.pausedAt = null
  }

  function elapsed(now = Date.now()) {
    const { phaseStartedAt, phasePausedMs, pausedAt } = timer.value
    if (phaseStartedAt == null) return 0
    const pausedNow = pausedAt != null ? now - pausedAt : 0
    return Math.max(0, (now - phaseStartedAt - phasePausedMs - pausedNow) / 1000)
  }

  function pause() {
    if (timer.value.pausedAt == null) timer.value.pausedAt = Date.now()
  }

  function resume() {
    if (timer.value.pausedAt == null) return
    timer.value.phasePausedMs += Date.now() - timer.value.pausedAt
    timer.value.pausedAt = null
  }

  function addTime(seconds: number) {
    timer.value.phaseSeconds += seconds
  }

  function reset() {
    timer.value = emptyTimer()
  }

  return { timer, isPaused, attach, enter, elapsed, pause, resume, addTime, reset }
}
