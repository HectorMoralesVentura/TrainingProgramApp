<script setup lang="ts">
import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import TrainingSteps from '~/features/training/components/TrainingSteps.vue'
import LevelSelector from '~/features/training/components/LevelSelector.vue'
import ExerciseCard from '~/features/training/components/ExerciseCard.vue'
import ExerciseDetailModal from '~/features/training/components/ExerciseDetailModal.vue'
import WorkoutLogModal from '~/features/progress/components/WorkoutLogModal.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const disciplineSlug = computed(() => String(route.params.discipline))
const zoneSlug = computed(() => String(route.params.zone))

const disciplinesQuery = useDisciplines()
const zonesQuery = useDisciplineZones(disciplineSlug)
const { data: exercises, isPending, isError, errorMessage } = useZoneExercises(disciplineSlug, zoneSlug)
const level = useDisciplineLevel(disciplineSlug)

const discipline = computed(() =>
  disciplinesQuery.data.value?.find(d => d.slug === disciplineSlug.value) ?? null,
)
const zone = computed(() =>
  zonesQuery.data.value?.find(z => z.slug === zoneSlug.value) ?? null,
)
const notFound = computed(() =>
  (disciplinesQuery.isSuccess.value && !discipline.value)
  || (zonesQuery.isSuccess.value && !zone.value),
)

const selected = ref<Exercise | null>(null)
const detailOpen = ref(false)

function openDetail(exercise: Exercise) {
  selected.value = exercise
  detailOpen.value = true
}

// Registrar: se cierra el detalle y se abre el formulario con el nivel que estaba viendo.
const logOpen = ref(false)
const logLevel = ref<ExerciseLevel>('beginner')

function openLog(exercise: Exercise, viewLevel: ExerciseLevel) {
  selected.value = exercise
  logLevel.value = viewLevel
  detailOpen.value = false
  logOpen.value = true
}

// Entrenamiento guiado: abre el selector de zonas con esta ya marcada (se pueden sumar más).
const { data: currentWorkout } = useCurrentWorkout()
const sessionRunning = computed(() => !!currentWorkout.value)
const suggestedSeconds = computed(() =>
  planDurationSeconds((exercises.value ?? []).map(e => plannedFromCatalog(e, zoneSlug.value, level.value))),
)

function startTraining() {
  navigateTo({ path: '/training/session/new', query: { discipline: disciplineSlug.value, zones: zoneSlug.value } })
}

useSeoMeta({
  title: () => zone.value?.name ?? t('training.steps.exercises'),
})
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6">
    <TrainingSteps :step="3" :discipline="discipline" :zone="zone" />

    <UEmpty
      v-if="notFound"
      icon="i-lucide-search-x"
      :title="t('training.notFound.zone')"
      :actions="[{ label: t('training.back'), icon: 'i-lucide-arrow-left', to: `/training/${disciplineSlug}` }]"
    />

    <template v-else>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div class="space-y-1">
          <p v-if="discipline" class="text-sm font-medium text-primary">
            {{ discipline.name }}
          </p>
          <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
            {{ zone?.name ?? t('training.steps.exercises') }}
          </h1>
          <p class="text-muted">
            {{ exercises?.length
              ? t('training.exercises.subtitle', exercises.length)
              : t('training.exercises.subtitleLoading') }}
          </p>
        </div>

        <!-- En móvil el selector queda fijo arriba al hacer scroll -->
        <div class="sticky top-0 z-10 -mx-4 px-4 py-2 bg-default/85 backdrop-blur sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none">
          <LevelSelector v-model="level" />
        </div>
      </div>

      <!-- Empezar un entrenamiento guiado con los ejercicios sugeridos de esta zona -->
      <div
        v-if="exercises?.length"
        class="rounded-xl bg-primary/10 ring ring-primary/25 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      >
        <div class="size-11 shrink-0 rounded-full bg-primary text-inverted hidden sm:flex items-center justify-center">
          <UIcon name="i-lucide-play" class="size-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-highlighted">
            {{ sessionRunning ? t('session.cta.runningTitle') : t('session.cta.title', { zone: zone?.name ?? '' }) }}
          </p>
          <p class="text-sm text-muted">
            {{ sessionRunning ? t('session.cta.runningDescription') : t('session.cta.description', { n: exercises.length, time: formatDuration(suggestedSeconds, t) }) }}
          </p>
        </div>
        <UButton
          v-if="sessionRunning"
          size="lg"
          icon="i-lucide-play"
          :label="t('session.cta.continue')"
          to="/training/session"
        />
        <UButton v-else size="lg" icon="i-lucide-play" :label="t('session.cta.start')" @click="startTraining" />
      </div>

      <UAlert
        v-if="isError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="t('training.loadError')"
        :description="errorMessage"
      />

      <UEmpty
        v-else-if="!isPending && !exercises?.length"
        icon="i-lucide-list-checks"
        :title="t('training.empty.exercises')"
        :actions="[{ label: t('training.back'), icon: 'i-lucide-arrow-left', to: `/training/${disciplineSlug}` }]"
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <template v-if="isPending">
          <USkeleton v-for="n in 3" :key="n" class="h-96 rounded-xl" />
        </template>
        <ExerciseCard
          v-for="(exercise, i) in exercises"
          v-else
          :key="exercise.id"
          :exercise="exercise"
          :level="level"
          :index="i + 1"
          @open="openDetail(exercise)"
        />
      </div>
    </template>

    <ExerciseDetailModal
      v-model:open="detailOpen"
      :exercise="selected"
      :level="level"
      @register="openLog"
    />
    <WorkoutLogModal
      v-model:open="logOpen"
      :exercise="selected"
      :level="logLevel"
      :discipline-slug="disciplineSlug"
    />
  </UContainer>
</template>
