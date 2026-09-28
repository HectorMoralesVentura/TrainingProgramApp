<script setup lang="ts">
import type { WorkoutFilters } from '~/features/progress/types/progress.types'
import { API_PAGE_SIZE } from '~/shared/types/api.types'
import WorkoutCard from '~/features/progress/components/WorkoutCard.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { today } = useDateFormat()
const { data: disciplines } = useDisciplines()

const filters = reactive<WorkoutFilters>({ discipline: '', date_from: '', date_to: '', page: 1 })

// Cualquier cambio de filtro regresa a la primera página.
watch(() => [filters.discipline, filters.date_from, filters.date_to], () => {
  filters.page = 1
})

const { data, isPending, isError, errorMessage, isPlaceholderData } = useWorkouts(() => ({ ...filters }))

const ALL = 'all'
const disciplineItems = computed(() => [
  { label: t('progress.workouts.allDisciplines'), value: ALL },
  ...(disciplines.value ?? []).map(d => ({ label: d.name, value: d.slug, icon: d.icon })),
])
const disciplineFilter = computed({
  get: () => filters.discipline || ALL,
  set: (value: string) => {
    filters.discipline = value === ALL ? '' : value
  },
})

const hasFilters = computed(() => !!(filters.discipline || filters.date_from || filters.date_to))

function clearFilters() {
  Object.assign(filters, { discipline: '', date_from: '', date_to: '' })
}

function disciplineOf(slug: string) {
  return disciplines.value?.find(d => d.slug === slug)
}

useSeoMeta({
  title: () => t('progress.workouts.title'),
})
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
          {{ t('progress.workouts.title') }}
        </h1>
        <p class="text-muted">
          {{ data ? t('progress.workouts.count', data.count) : t('progress.workouts.subtitle') }}
        </p>
      </div>
      <UButton to="/training" icon="i-lucide-dumbbell" :label="t('training.home.cta')" class="self-start sm:self-auto" />
    </div>

    <div class="grid gap-3 grid-cols-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,11rem)_minmax(0,11rem)_auto] items-end">
      <UFormField :label="t('progress.workouts.filterDiscipline')" class="col-span-2 sm:col-span-1">
        <USelect v-model="disciplineFilter" :items="disciplineItems" class="w-full" />
      </UFormField>
      <UFormField :label="t('progress.workouts.dateFrom')">
        <UInput v-model="filters.date_from" type="date" :max="filters.date_to || today()" class="w-full" />
      </UFormField>
      <UFormField :label="t('progress.workouts.dateTo')">
        <UInput v-model="filters.date_to" type="date" :min="filters.date_from || undefined" :max="today()" class="w-full" />
      </UFormField>
      <UButton
        v-if="hasFilters"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        class="col-span-2 sm:col-span-1 justify-self-start"
        :label="t('progress.workouts.clearFilters')"
        @click="clearFilters"
      />
    </div>

    <UAlert
      v-if="isError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('progress.workouts.loadError')"
      :description="errorMessage"
    />

    <div v-else-if="isPending" class="grid gap-4 lg:grid-cols-2">
      <USkeleton v-for="n in 4" :key="n" class="h-44 rounded-xl" />
    </div>

    <UEmpty
      v-else-if="!data?.count"
      icon="i-lucide-clipboard-list"
      :title="hasFilters ? t('progress.workouts.emptyFiltered') : t('progress.workouts.empty')"
      :description="hasFilters ? undefined : t('progress.workouts.emptyDescription')"
      :actions="hasFilters
        ? [{ label: t('progress.workouts.clearFilters'), icon: 'i-lucide-x', color: 'neutral', variant: 'outline', onClick: clearFilters }]
        : [{ label: t('training.home.cta'), icon: 'i-lucide-dumbbell', to: '/training' }]"
    />

    <template v-else>
      <div class="grid gap-4 lg:grid-cols-2 transition-opacity" :class="isPlaceholderData && 'opacity-60'">
        <WorkoutCard
          v-for="workout in data.results"
          :key="workout.id"
          :workout="workout"
          :discipline-name="disciplineOf(workout.discipline)?.name ?? workout.discipline"
          :discipline-icon="disciplineOf(workout.discipline)?.icon ?? 'i-lucide-dumbbell'"
        />
      </div>
      <div v-if="data.count > API_PAGE_SIZE" class="flex justify-center">
        <UPagination v-model:page="filters.page" :total="data.count" :items-per-page="API_PAGE_SIZE" />
      </div>
    </template>
  </UContainer>
</template>
