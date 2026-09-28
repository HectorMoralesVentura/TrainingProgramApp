import type { TimerPhase } from '~/features/workout-session/composables/useWorkoutTimer'

/**
 * Reloj del reproductor: segundos restantes de la fase y aviso al agotarse (sonido + vibración).
 * `onExpire` decide qué pasa al terminar cada fase con cuenta regresiva (prepare, work, rest).
 */
export function useSessionClock(onExpire: (phase: TimerPhase) => void) {
  const { timer, isPaused, elapsed: phaseElapsed } = useWorkoutTimer()
  const now = useNow({ interval: 250 })
  const { beep, buzz } = usePhaseAlert()

  const elapsed = computed(() => phaseElapsed(now.value.getTime()))
  const remaining = computed(() => Math.max(0, timer.value.phaseSeconds - elapsed.value))
  const progress = computed(() => {
    const total = timer.value.phaseSeconds
    return total > 0 ? Math.min(1, elapsed.value / total) : 0
  })

  // Se revisa en cada tic (no solo cuando cambia `remaining`): si el usuario vuelve tras varias fases
  // vencidas, `remaining` se queda en 0 y un watch sobre él no volvería a dispararse.
  let lastWholeSecond = -1
  watch(now, () => {
    const phase = timer.value.phase
    if (phase === 'log' || isPaused.value || timer.value.phaseStartedAt == null) return
    const value = remaining.value
    const whole = Math.ceil(value)
    if (whole !== lastWholeSecond && whole > 0 && whole <= 3) beep(660, 0.08)
    lastWholeSecond = whole
    if (value <= 0) {
      beep(phase === 'work' ? 440 : 880, 0.25)
      buzz()
      onExpire(phase)
    }
  })

  return { now, elapsed, remaining, progress }
}
