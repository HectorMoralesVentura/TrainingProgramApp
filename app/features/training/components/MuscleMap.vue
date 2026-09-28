<script setup lang="ts">
import type { MuscleId, MuscleRegion, MuscleView } from '~/features/training/utils/muscle-map.data'

const props = withDefaults(defineProps<{
  /** Músculos resaltados. */
  highlighted: MuscleId[]
  view?: 'both' | MuscleView
  /** Recorte vertical: cuerpo completo, tren superior o tren inferior. */
  region?: MuscleRegion
}>(), {
  view: 'both',
  region: 'full',
})

const { t } = useI18n()

// Cada vista va en su propio <svg> (recorte del lienzo 1920x1920) para que "ambas" no deje el hueco central.
const sides = computed<MuscleView[]>(() => (props.view === 'both' ? ['front', 'back'] : [props.view]))

function viewBox(side: MuscleView) {
  const [y, height] = MUSCLE_Y_RANGE[props.region]
  return `${MUSCLE_X_START[side]} ${y} ${MUSCLE_VIEW_WIDTH} ${height}`
}

const highlightedSet = computed(() => new Set(props.highlighted))

function musclesFor(side: MuscleView) {
  return MUSCLE_IDS.map(id => ({ id, active: highlightedSet.value.has(id), paths: MUSCLE_PATHS[id][side] }))
}

const label = computed(() =>
  props.highlighted.length
    ? t('training.muscleMap.label', { muscles: props.highlighted.map(id => t(`training.muscleMap.names.${id}`)).join(', ') })
    : t('training.muscleMap.empty'),
)
</script>

<template>
  <div role="img" :aria-label="label" class="flex items-stretch justify-center gap-[4%]">
    <svg v-for="side in sides" :key="side" :viewBox="viewBox(side)" aria-hidden="true" class="block h-full w-auto min-w-0">
      <!-- La silueta está en ambas mitades del lienzo; el viewBox recorta la que corresponde -->
      <g class="fill-(--ui-bg-accented)">
        <path v-for="(d, i) in BODY_PATHS" :key="i" :d="d" />
      </g>
      <g
        v-for="muscle in musclesFor(side)"
        :key="muscle.id"
        class="transition-colors duration-200"
        :class="muscle.active ? 'fill-primary' : 'fill-(--ui-text-muted) opacity-30'"
      >
        <title>{{ t(`training.muscleMap.names.${muscle.id}`) }}</title>
        <path v-for="(d, i) in muscle.paths" :key="i" :d="d" />
      </g>
    </svg>
  </div>
</template>
