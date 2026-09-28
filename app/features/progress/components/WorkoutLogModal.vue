<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import type { WorkoutLogForm } from '~/features/progress/schemas/workout.schema'
import type { WorkoutSetPayload } from '~/features/progress/types/progress.types'

const props = defineProps<{
  exercise: Exercise | null
  level: ExerciseLevel
  disciplineSlug: string
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const isMobile = useMediaQuery('(max-width: 639px)')
const form = useTemplateRef('form')
const { mutateAsync, isPending } = useCreateWorkout()

const schema = computed(() => createWorkoutLogSchema(t))

type SetRow = WorkoutLogForm['sets'][number]
const state = reactive<{ perceived_effort: number | null, notes: string, sets: SetRow[] }>({
  perceived_effort: null,
  notes: '',
  sets: [],
})

const spec = computed(() => (props.exercise ? levelSpec(props.exercise.levels, props.level) : null))
// Sostenimiento: se registra tiempo en lugar de repeticiones.
const isHold = computed(() => spec.value != null && spec.value.reps == null && !spec.value.to_failure)
const usesWeight = computed(() => props.exercise?.equipment != null)

function newRow(): SetRow {
  return {
    reps: isHold.value ? null : spec.value?.reps ?? null,
    duration_seconds: isHold.value ? spec.value?.duration_seconds ?? null : null,
    weight_kg: usesWeight.value ? spec.value?.suggested_weight_kg ?? null : null,
  }
}

// Prellena las series con los valores del nivel elegido cada vez que se abre.
watch(open, (isOpen) => {
  if (!isOpen || !spec.value) return
  state.perceived_effort = null
  state.notes = ''
  state.sets = Array.from({ length: spec.value.sets }, newRow)
  form.value?.clear()
})

function addSet() {
  const last = state.sets.at(-1)
  state.sets.push(last ? { ...last } : newRow())
}

function removeSet(index: number) {
  state.sets.splice(index, 1)
}

function toSetPayload(row: SetRow, index: number): WorkoutSetPayload {
  const payload: WorkoutSetPayload = { set_number: index + 1 }
  if (row.reps != null) payload.reps = row.reps
  if (row.duration_seconds != null) payload.duration_seconds = row.duration_seconds
  if (row.weight_kg != null) payload.weight_kg = row.weight_kg
  return payload
}

async function onSubmit(event: FormSubmitEvent<WorkoutLogForm>) {
  if (!props.exercise) return
  try {
    await mutateAsync({
      discipline: props.disciplineSlug,
      perceived_effort: event.data.perceived_effort ?? undefined,
      notes: event.data.notes || undefined,
      exercises: [{
        exercise: props.exercise.slug,
        level: props.level,
        sets: event.data.sets.map(toSetPayload),
      }],
    })
    open.value = false
  } catch (error) {
    // El toast ya lo muestra la mutación; aquí solo marcamos los campos que el backend rechazó.
    form.value?.setErrors(apiFieldErrors(error))
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('progress.workouts.registerTitle')"
    :description="exercise ? `${exercise.name} · ${t(`training.levels.${level}`)}` : undefined"
    :fullscreen="isMobile"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <UForm
        id="workout-log-form"
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-5"
        @submit="onSubmit"
      >
        <section class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-highlighted">
              {{ t('progress.workouts.sets') }}
            </h3>
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              :label="t('progress.workouts.addSet')"
              @click="addSet"
            />
          </div>

          <UFormField name="sets">
            <div class="space-y-2">
              <div
                v-for="(row, i) in state.sets"
                :key="i"
                class="grid items-start gap-2 rounded-lg bg-elevated p-2"
                :class="usesWeight ? 'grid-cols-[2rem_1fr_1fr_2rem]' : 'grid-cols-[2rem_1fr_2rem]'"
              >
                <span class="mt-1.5 size-7 rounded-full bg-default text-sm font-semibold text-highlighted flex items-center justify-center">
                  {{ i + 1 }}
                </span>

                <UFormField v-if="isHold" :name="`sets.${i}.duration_seconds`" :ui="{ label: 'sr-only' }" :label="t('progress.workouts.seconds')">
                  <UInputNumber
                    v-model="row.duration_seconds"
                    :min="1"
                    :placeholder="t('progress.workouts.seconds')"
                    :format-options="{ style: 'unit', unit: 'second', unitDisplay: 'short' }"
                    class="w-full"
                  />
                </UFormField>
                <UFormField v-else :name="`sets.${i}.reps`" :ui="{ label: 'sr-only' }" :label="t('training.exercise.reps')">
                  <UInputNumber
                    v-model="row.reps"
                    :min="1"
                    :placeholder="t('training.exercise.reps')"
                    class="w-full"
                  />
                </UFormField>

                <UFormField v-if="usesWeight" :name="`sets.${i}.weight_kg`" :ui="{ label: 'sr-only' }" :label="t('training.exercise.weight')">
                  <UInputNumber
                    v-model="row.weight_kg"
                    :min="0"
                    :step="2.5"
                    :placeholder="t('training.exercise.weight')"
                    :format-options="{ style: 'unit', unit: 'kilogram', unitDisplay: 'short', maximumFractionDigits: 2 }"
                    class="w-full"
                  />
                </UFormField>

                <UButton
                  class="mt-0.5"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  :disabled="state.sets.length === 1"
                  :aria-label="t('progress.workouts.removeSet', { n: i + 1 })"
                  @click="removeSet(i)"
                />
              </div>
            </div>
          </UFormField>
        </section>

        <UFormField name="perceived_effort" :label="t('progress.workouts.effort')" :help="t('progress.workouts.effortHelp')">
          <UInputNumber v-model="state.perceived_effort" :min="1" :max="10" :placeholder="t('common.optional')" class="w-full sm:w-40" />
        </UFormField>

        <UFormField name="notes" :label="t('progress.workouts.notes')">
          <UTextarea v-model="state.notes" :rows="2" :maxlength="500" autoresize class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" :label="t('common.cancel')" @click="open = false" />
        <UButton type="submit" form="workout-log-form" icon="i-lucide-check" :loading="isPending" :label="t('common.save')" />
      </div>
    </template>
  </UModal>
</template>
