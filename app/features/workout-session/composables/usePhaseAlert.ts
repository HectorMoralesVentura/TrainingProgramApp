/** Sonido corto (Web Audio) y vibración para avisar cambios de fase. Se pueden silenciar. */
export function usePhaseAlert() {
  const muted = useState('workout-session-muted', () => false)
  let audio: AudioContext | null = null

  function beep(frequency = 880, seconds = 0.15) {
    if (muted.value || typeof window === 'undefined' || !('AudioContext' in window)) return
    try {
      audio ??= new AudioContext()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.2, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + seconds)
      osc.connect(gain).connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + seconds)
    } catch {
      // El navegador puede bloquear el audio hasta la primera interacción; no es crítico.
    }
  }

  function buzz() {
    if (!muted.value && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(200)
  }

  return { muted, beep, buzz }
}
