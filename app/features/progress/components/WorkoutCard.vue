<script setup lang="ts">
import type { Workout, WorkoutSet } from '~/features/progress/types/progress.types'

const props = defineProps<{
  workout: Workout
  disciplineName: string
  disciplineIcon: string
}>()

const { t } = useI18n()
const { formatDate } = useDateFormat()

const durationMinutes = computed(() => {
  if (!props.workout.ended_at) return null
  const ms = new Date(props.workout.ended_at).getTime() - new Date(props.workout.started_at).getTime()
  return ms > 0 ? Math.round(ms / 60_000) : null
})

function formatSet(set: WorkoutSet) {
  const amount = set.reps != null ? `${set.reps}` : formatTrainingSeconds(set.duration_seconds ?? 0)
  return set.weight_kg != null ? `${amount} × ${formatWeight(set.weight_kg)}` : amount
}
</script>

<template>
  <UCard :ui="{ header: 'p-4 sm:px-5', body: 'p-4 sm:p-5 space-y-3' }">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="size-10 shrink-0 rounded-xl flex items-center justify-center" :class="disciplineAccent(workout.discipline)">
            <UIcon :name="disciplineIcon" class="size-5" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-highlighted truncate">
              {{ disciplineName }}
            </p>
            <p class="text-xs text-muted">
              {{ formatDate(workout.started_at, { dateStyle: 'medium', timeStyle: 'short' }) }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-if="durationMinutes"
            color="neutral"
            variant="subtle"
            icon="i-lucide-timer"
            :label="t('progress.workouts.minutes', { n: durationMinutes })"
          />
          <UBadge
            v-if="workout.perceived_effort"
            color="primary"
            variant="subtle"
            icon="i-lucide-gauge"
            :label="t('progress.workouts.effortValue', { n: workout.perceived_effort })"
          />
        </div>
      </div>
    </template>

    <div v-for="log in workout.exercises" :key="log.id" class="space-y-1.5">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-medium text-highlighted">
          {{ log.exercise.name }}
        </p>
        <UBadge
          size="sm"
          variant="subtle"
          :color="trainingLevelMeta(log.level).color"
          :icon="trainingLevelMeta(log.level).icon"
          :label="t(`training.levels.${log.level}`)"
        />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="set in log.sets"
          :key="set.set_number"
          class="rounded-md bg-elevated px-2 py-1 text-xs tabular-nums text-default"
        >
          <span class="text-muted">{{ set.set_number }}.</span> {{ formatSet(set) }}
        </span>
      </div>
    </div>

    <p v-if="workout.notes" class="text-sm text-muted border-t border-default pt-3">
      {{ workout.notes }}
    </p>
  </UCard>
</template>
