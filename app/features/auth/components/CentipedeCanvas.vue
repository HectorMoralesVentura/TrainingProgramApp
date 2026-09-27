<script setup lang="ts">
// Canvas nativo: Nuxt UI no tiene un equivalente para animaciones 2D.
const canvas = ref<HTMLCanvasElement | null>(null)

const SEGMENTS = 30
const SEGMENT_GAP = 13
const MAX_SPEED = 4.2
const TURN_RATE = 0.1
const HEAD_RADIUS = 9
const TAIL_RADIUS = 3

let cleanup: (() => void) | null = null

onMounted(() => {
  const el = canvas.value
  const context = el?.getContext('2d')
  if (!el || !context) return
  const canvasEl: HTMLCanvasElement = el
  const ctx: CanvasRenderingContext2D = context

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const target = { x: 0, y: 0, active: false }
  const colors = { body: '#14b8a6', legs: '#737373', eyes: '#ffffff' }
  let width = 0
  let height = 0
  let heading = 0
  let time = 0
  let frame = 0
  let segments: { x: number, y: number }[] = []

  function readColors() {
    const styles = getComputedStyle(document.documentElement)
    colors.body = styles.getPropertyValue('--ui-primary').trim() || colors.body
    colors.legs = styles.getPropertyValue('--ui-text-muted').trim() || colors.legs
    colors.eyes = styles.getPropertyValue('--ui-bg').trim() || colors.eyes
  }

  function resize() {
    const rect = canvasEl.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    width = rect.width
    height = rect.height
    canvasEl.width = Math.round(width * dpr)
    canvasEl.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (segments.length === 0) {
      segments = Array.from({ length: SEGMENTS }, (_, i) => ({
        x: width / 2 - i * SEGMENT_GAP,
        y: height / 2,
      }))
    }
  }

  function onPointerMove(event: PointerEvent) {
    const rect = canvasEl.getBoundingClientRect()
    // Se limita al panel: si el cursor está sobre el formulario, el ciempiés se queda en el borde.
    target.x = Math.min(Math.max(event.clientX - rect.left, 0), width)
    target.y = Math.min(Math.max(event.clientY - rect.top, 0), height)
    target.active = true
  }

  function onPointerLeave() {
    target.active = false
  }

  function step() {
    time += 1
    const head = segments[0]!

    // Sin cursor, deambula siguiendo una curva suave.
    const goal = target.active
      ? target
      : {
          x: width / 2 + Math.cos(time * 0.011) * width * 0.32,
          y: height / 2 + Math.sin(time * 0.017) * height * 0.3,
        }

    const dx = goal.x - head.x
    const dy = goal.y - head.y
    const distance = Math.hypot(dx, dy)

    let diff = Math.atan2(dy, dx) - heading
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    heading += diff * TURN_RATE

    const speed = distance < 6 ? 0 : Math.min(MAX_SPEED, distance * 0.06)
    const wiggle = Math.sin(time * 0.18) * 0.35 * (speed / MAX_SPEED)
    head.x += Math.cos(heading + wiggle) * speed
    head.y += Math.sin(heading + wiggle) * speed

    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1]!
      const seg = segments[i]!
      const angle = Math.atan2(prev.y - seg.y, prev.x - seg.x)
      seg.x = prev.x - Math.cos(angle) * SEGMENT_GAP
      seg.y = prev.y - Math.sin(angle) * SEGMENT_GAP
    }

    return speed
  }

  function radiusAt(i: number) {
    const t = i / (segments.length - 1)
    return HEAD_RADIUS + (TAIL_RADIUS - HEAD_RADIUS) * t
  }

  function draw(speed: number) {
    ctx.clearRect(0, 0, width, height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const gait = time * 0.25 * (0.3 + speed / MAX_SPEED)

    // Patas: dos por segmento, alternando fase para simular el andar.
    ctx.strokeStyle = colors.legs
    ctx.lineWidth = 1.6
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i]!
      const prev = segments[i - 1]!
      const angle = Math.atan2(prev.y - seg.y, prev.x - seg.x)
      const length = radiusAt(i) * 2.2
      const swing = Math.sin(gait + i * 0.9) * 0.5

      for (const side of [-1, 1]) {
        const legAngle = angle + side * (Math.PI / 2) + swing * side
        const kneeX = seg.x + Math.cos(legAngle) * length * 0.6
        const kneeY = seg.y + Math.sin(legAngle) * length * 0.6
        const footAngle = legAngle - side * 0.6
        ctx.beginPath()
        ctx.moveTo(seg.x, seg.y)
        ctx.lineTo(kneeX, kneeY)
        ctx.lineTo(kneeX + Math.cos(footAngle) * length * 0.5, kneeY + Math.sin(footAngle) * length * 0.5)
        ctx.stroke()
      }
    }

    // Cuerpo: de la cola a la cabeza para que la cabeza quede encima.
    ctx.fillStyle = colors.body
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i]!
      ctx.globalAlpha = 0.55 + 0.45 * (1 - i / segments.length)
      ctx.beginPath()
      ctx.arc(seg.x, seg.y, radiusAt(i), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Cabeza: antenas y ojos.
    const head = segments[0]!
    const neck = segments[1]!
    const facing = Math.atan2(head.y - neck.y, head.x - neck.x)

    ctx.strokeStyle = colors.body
    ctx.lineWidth = 1.8
    for (const side of [-1, 1]) {
      const antennaAngle = facing + side * (0.45 + Math.sin(time * 0.12 + side) * 0.15)
      const baseX = head.x + Math.cos(facing) * HEAD_RADIUS * 0.6
      const baseY = head.y + Math.sin(facing) * HEAD_RADIUS * 0.6
      ctx.beginPath()
      ctx.moveTo(baseX, baseY)
      ctx.quadraticCurveTo(
        baseX + Math.cos(antennaAngle) * 10,
        baseY + Math.sin(antennaAngle) * 10,
        baseX + Math.cos(antennaAngle + side * 0.4) * 22,
        baseY + Math.sin(antennaAngle + side * 0.4) * 22,
      )
      ctx.stroke()
    }

    ctx.fillStyle = colors.eyes
    for (const side of [-1, 1]) {
      const eyeAngle = facing + side * 0.6
      ctx.beginPath()
      ctx.arc(
        head.x + Math.cos(eyeAngle) * HEAD_RADIUS * 0.55,
        head.y + Math.sin(eyeAngle) * HEAD_RADIUS * 0.55,
        2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }

  function loop() {
    // Los colores cambian con el modo claro/oscuro; basta con releerlos cada medio segundo.
    if (time % 30 === 0) readColors()
    draw(step())
    frame = requestAnimationFrame(loop)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvasEl)
  resize()
  readColors()

  if (reducedMotion) {
    // Sin animación: se dibuja una sola pose estática.
    let speed = 0
    for (let i = 0; i < 240; i++) speed = step()
    draw(speed)
  } else {
    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    frame = requestAnimationFrame(loop)
  }

  cleanup = () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" />
</template>
