<script setup lang="ts">
import type { TimerPhase } from '~/features/workout-session/composables/useWorkoutTimer'

const props = defineProps<{
  remaining: number
  /** 0..1 de la fase transcurrida. */
  progress: number
  phase: TimerPhase
  paused: boolean
}>()

const { t } = useI18n()

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const color = computed(() => (props.phase === 'work' ? 'stroke-primary' : props.phase === 'rest' ? 'stroke-info' : 'stroke-warning'))
const textColor = computed(() => (props.phase === 'work' ? 'text-primary' : props.phase === 'rest' ? 'text-info' : 'text-warning'))
</script>

<template>
  <div class="relative aspect-square w-full max-w-[18rem] mx-auto" role="timer" :aria-label="t(`session.phase.${phase}`)">
    <svg viewBox="0 0 200 200" class="size-full -rotate-90">
      <circle cx="100" cy="100" :r="RADIUS" fill="none" stroke-width="10" class="stroke-(--ui-bg-accented)" />
      <circle
        cx="100"
        cy="100"
        :r="RADIUS"
        fill="none"
        stroke-width="10"
        stroke-linecap="round"
        :class="color"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="CIRCUMFERENCE * progress"
        style="transition: stroke-dashoffset 250ms linear"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
      <span class="text-sm font-semibold uppercase tracking-widest" :class="textColor">
        {{ paused ? t('session.player.paused') : t(`session.phase.${phase}`) }}
      </span>
      <span class="text-6xl sm:text-7xl font-bold tabular-nums text-highlighted" :class="paused && 'opacity-50'">
        {{ formatClock(Math.ceil(remaining)) }}
      </span>
    </div>
  </div>
</template>
