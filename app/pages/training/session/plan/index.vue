<script setup lang="ts">
import PlannedExerciseCard from '~/features/workout-session/components/PlannedExerciseCard.vue'
import AddExercisesModal from '~/features/workout-session/components/AddExercisesModal.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const draft = useWorkoutPlanDraft()
const state = draft.state

// Sin borrador (p. ej. entrada directa por URL) se vuelve a elegir disciplina.
if (!state.value.discipline) await navigateTo('/training')

const disciplineSlug = computed(() => state.value.discipline?.slug ?? '')
const level = useDisciplineLevel(disciplineSlug)
const { data: zonesCatalog } = useDisciplineZones(disciplineSlug)

const zoneNames = computed<Record<string, string>>(() => {
  const names: Record<string, string> = {}
  for (const z of zonesCatalog.value ?? []) names[z.slug] = z.name
  for (const z of state.value.zones) names[z.slug] = z.name
  return names
})
const inPlan = computed(() => state.value.items.map(i => i.exercise.slug))

const addOpen = ref(false)
const conflictOpen = ref(false)

const start = useStartWorkout()
const cancel = useCancelWorkout()
const { data: current, refetch: refetchCurrent } = useCurrentWorkout()

function startPayload() {
  return {
    discipline: disciplineSlug.value,
    exercises: state.value.items.map(i => ({ exercise: i.exercise.slug, level: i.level })),
  }
}

async function onStart() {
  try {
    await start.mutateAsync(startPayload())
    draft.clear()
    await navigateTo('/training/session')
  } catch (error) {
    if (isWorkoutConflict(error)) {
      await refetchCurrent()
      conflictOpen.value = true
    }
  }
}

// 409: hay otro entrenamiento en curso -> continuar ese o cancelarlo y empezar este.
async function cancelPreviousAndStart() {
  if (!current.value) return
  try {
    await cancel.mutateAsync(current.value.id)
    conflictOpen.value = false
    await onStart()
  } catch {
    // El toast de error lo muestra la mutación.
  }
}

function back() {
  const zones = state.value.zones.map(z => z.slug).join(',')
  navigateTo({ path: '/training/session/new', query: { discipline: disciplineSlug.value, zones } })
}

useSeoMeta({ title: () => t('session.plan.title') })
</script>

<template>
  <UContainer class="py-4 sm:py-8 pb-32 space-y-6">
    <div class="flex items-center gap-2">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" :aria-label="t('training.back')" @click="back" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-primary">
          {{ state.discipline?.name }} · {{ state.zones.map(z => z.name).join(', ') }}
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
          {{ t('session.plan.title') }}
        </h1>
      </div>
    </div>
    <p class="text-muted -mt-3">
      {{ t('session.plan.subtitle') }}
    </p>

    <div class="grid grid-cols-3 gap-2 sm:gap-3">
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.plan.exercises') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ state.items.length }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('training.exercise.sets') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ draft.totalSets.value }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.plan.estimatedTotal') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          ~{{ formatDuration(draft.estimatedSeconds.value, t) }}
        </p>
      </div>
    </div>

    <UEmpty
      v-if="!state.items.length"
      icon="i-lucide-list-plus"
      :title="t('session.plan.empty')"
      :actions="[{ label: t('session.plan.addExercises'), icon: 'i-lucide-plus', onClick: () => (addOpen = true) }]"
    />

    <TransitionGroup v-else tag="div" name="list" class="space-y-3">
      <PlannedExerciseCard
        v-for="(item, i) in state.items"
        :key="item.uid"
        :item="item"
        :zone-name="zoneNames[item.zone] ?? item.zone"
        :index="i"
        :total="state.items.length"
        :max-level="item.max_level"
        @remove="draft.remove(item.uid)"
        @move="dir => draft.move(item.uid, dir)"
        @level="lvl => draft.setLevel(item.uid, lvl)"
      />
    </TransitionGroup>

    <UButton
      v-if="state.items.length"
      block
      color="neutral"
      variant="outline"
      icon="i-lucide-plus"
      :label="t('session.plan.addExercises')"
      @click="addOpen = true"
    />

    <div class="fixed inset-x-0 bottom-0 z-10 border-t border-default bg-default/90 backdrop-blur">
      <UContainer class="py-3 flex items-center justify-between gap-3">
        <div class="text-sm">
          <p class="text-muted">
            {{ t('session.plan.estimatedTotal') }}
          </p>
          <p class="font-semibold text-highlighted tabular-nums">
            {{ formatClock(draft.estimatedSeconds.value) }}
          </p>
        </div>
        <UButton size="xl" icon="i-lucide-play" :disabled="!state.items.length" :loading="start.isPending.value" :label="t('session.plan.start')" @click="onStart" />
      </UContainer>
    </div>

    <AddExercisesModal
      v-if="state.discipline"
      v-model:open="addOpen"
      :discipline-slug="state.discipline.slug"
      :in-plan="inPlan"
      @add="(exercise, zone) => draft.addFromCatalog(exercise, zone, level)"
    />

    <UModal v-model:open="conflictOpen" :title="t('session.conflict.title')" :description="t('session.conflict.description')">
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-2">
          <UButton color="error" variant="soft" :loading="cancel.isPending.value" :label="t('session.conflict.cancelPrevious')" @click="cancelPreviousAndStart" />
          <UButton icon="i-lucide-play" :label="t('session.conflict.continuePrevious')" to="/training/session" />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped>
.list-move { transition: transform 0.25s ease; }
</style>
