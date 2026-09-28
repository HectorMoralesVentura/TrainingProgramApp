<script setup lang="ts">
import type { ExerciseLevel } from '~/features/training/types/training.types'
import type { PlannedExercise } from '~/features/workout-session/types/workout.types'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

const props = defineProps<{
  item: PlannedExercise
  zoneName: string
  index: number
  total: number
  /** Tope por condición médica, si se conoce. */
  maxLevel?: ExerciseLevel | null
}>()

const emit = defineEmits<{ remove: [], move: [direction: -1 | 1], level: [level: ExerciseLevel] }>()

const { t } = useI18n()

const layout = computed(() => exerciseMuscleLayout(muscleIdsFromNames(props.item.exercise.muscles)))
const target = computed(() => {
  if (props.item.to_failure) return t('training.exercise.toFailureShort')
  if (isHoldExercise(props.item)) return formatClock(props.item.duration_seconds ?? 0)
  return t('session.player.repsTarget', { n: props.item.reps })
})
const levelItems = computed(() =>
  TRAINING_LEVELS.map(l => ({
    label: t(`training.levels.${l.value}`),
    value: l.value,
    icon: isLevelAbove(l.value, props.maxLevel ?? null) ? 'i-lucide-lock' : l.icon,
    disabled: isLevelAbove(l.value, props.maxLevel ?? null),
  })),
)
const levelModel = computed({
  get: () => props.item.level,
  set: (value: ExerciseLevel) => emit('level', value),
})
</script>

<template>
  <UCard :ui="{ body: 'p-3 sm:p-4 flex gap-3 sm:gap-4' }">
    <div class="hidden sm:flex w-24 shrink-0 items-center justify-center rounded-lg bg-elevated p-1.5">
      <img v-if="item.exercise.media.illustration_url" :src="item.exercise.media.illustration_url" :alt="item.exercise.name" class="max-h-24 w-auto object-contain">
      <MuscleMap v-else-if="layout" :highlighted="layout.muscles" :view="layout.view" :region="layout.region" class="h-24 w-auto max-w-full" />
    </div>

    <div class="flex-1 min-w-0 space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-xs text-muted">
            {{ index + 1 }} · {{ zoneName }}
          </p>
          <h3 class="font-semibold text-highlighted leading-snug">
            {{ item.exercise.name }}
          </h3>
        </div>
        <div class="flex shrink-0">
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-chevron-up" :disabled="index === 0" :aria-label="t('session.plan.moveUp')" @click="emit('move', -1)" />
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-chevron-down" :disabled="index === total - 1" :aria-label="t('session.plan.moveDown')" @click="emit('move', 1)" />
          <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash-2" :aria-label="t('session.plan.remove', { name: item.exercise.name })" @click="emit('remove')" />
        </div>
      </div>

      <UAlert
        v-if="item.restriction_note"
        color="warning"
        variant="subtle"
        icon="i-lucide-shield-alert"
        :description="item.restriction_note"
        :ui="{ description: 'text-xs' }"
      />

      <div class="flex flex-col sm:flex-row sm:items-end gap-3">
        <UFormField :label="t('training.level.label')" class="sm:w-44">
          <USelect v-model="levelModel" :items="levelItems" size="sm" class="w-full" />
        </UFormField>
        <div class="flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="subtle" icon="i-lucide-layers" :label="t('session.plan.setsCount', { n: item.sets })" />
          <UBadge color="primary" variant="subtle" :icon="isHoldExercise(item) ? 'i-lucide-timer' : 'i-lucide-repeat'" :label="target" />
          <UBadge color="neutral" variant="subtle" icon="i-lucide-hourglass" :label="t('session.plan.restBadge', { time: formatClock(item.rest_seconds) })" />
          <UBadge v-if="item.suggested_weight_kg != null" color="neutral" variant="subtle" icon="i-lucide-weight" :label="formatWeight(item.suggested_weight_kg)" />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-timer" class="size-3.5" />
          {{ t('session.plan.workPerSet', { time: formatClock(workSecondsFor(item)) }) }}
        </span>
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3.5" />
          {{ t('session.plan.estimated', { time: formatDuration(item.estimated_seconds, t) }) }}
        </span>
      </div>
    </div>
  </UCard>
</template>
