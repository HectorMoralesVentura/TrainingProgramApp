<script setup lang="ts">
import type { Workout } from '~/features/workout-session/types/workout.types'

const props = defineProps<{
  workout: Workout
  /** ExerciseLog en el que está el usuario. */
  currentLogId: number | null
  zoneNames: Record<string, string>
}>()

const emit = defineEmits<{ select: [logId: number], add: [] }>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const deleteSet = useDeleteSet()
const removeExercise = useRemoveWorkoutExercise()

function setLabel(set: Workout['exercises'][number]['sets_done'][number], hold: boolean) {
  const amount = hold || set.reps == null ? formatClock(set.duration_seconds ?? 0) : `${set.reps}`
  return set.weight_kg != null ? `${amount} × ${formatWeight(set.weight_kg)}` : amount
}
</script>

<template>
  <USlideover v-model:open="open" :title="t('session.list.title')" :description="t('session.list.description')">
    <template #body>
      <ul class="space-y-3">
        <li
          v-for="item in props.workout.exercises"
          :key="item.id ?? item.exercise.slug"
          class="rounded-lg ring p-3 space-y-2"
          :class="item.id === currentLogId ? 'ring-primary bg-primary/5' : 'ring-default'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs text-muted">
                {{ zoneNames[item.zone] ?? item.zone }} · {{ t(`training.levels.${item.level}`) }}
              </p>
              <p class="font-medium text-highlighted">
                {{ item.exercise.name }}
              </p>
            </div>
            <UBadge
              :color="item.completed ? 'success' : 'neutral'"
              variant="subtle"
              :icon="item.completed ? 'i-lucide-check' : undefined"
              :label="t('session.summary.setsOf', { done: item.sets_done.length, total: item.sets })"
            />
          </div>

          <!-- Series registradas: se pueden borrar si hubo un error de captura -->
          <div v-if="item.sets_done.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="set in item.sets_done"
              :key="set.id"
              class="inline-flex items-center gap-1 rounded-md bg-elevated ps-2 text-xs tabular-nums"
            >
              <span class="text-muted">{{ set.set_number }}.</span> {{ setLabel(set, isHoldExercise(item)) }}
              <UButton
                color="neutral"
                variant="link"
                size="xs"
                icon="i-lucide-x"
                :loading="deleteSet.isPending.value && deleteSet.variables.value?.setId === set.id"
                :aria-label="t('session.list.deleteSet', { n: set.set_number })"
                @click="deleteSet.mutate({ workoutId: workout.id, logId: item.id!, setId: set.id })"
              />
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="!item.completed && item.id !== currentLogId"
              size="xs"
              variant="soft"
              icon="i-lucide-play"
              :label="t('session.list.doNow')"
              @click="emit('select', item.id!); open = false"
            />
            <UButton
              v-if="!item.sets_done.length"
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              :loading="removeExercise.isPending.value && removeExercise.variables.value?.logId === item.id"
              :label="t('session.list.remove')"
              @click="removeExercise.mutate({ workoutId: workout.id, logId: item.id! })"
            />
          </div>
        </li>
      </ul>
    </template>
    <template #footer>
      <UButton block variant="outline" icon="i-lucide-plus" :label="t('session.plan.addExercises')" @click="emit('add')" />
    </template>
  </USlideover>
</template>
