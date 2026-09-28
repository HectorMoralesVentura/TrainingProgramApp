<script setup lang="ts">
import TrainingSteps from '~/features/training/components/TrainingSteps.vue'
import ZoneCard from '~/features/training/components/ZoneCard.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const disciplineSlug = computed(() => String(route.params.discipline))

const disciplinesQuery = useDisciplines()
const { data: zones, isPending, isError, errorMessage } = useDisciplineZones(disciplineSlug)

const discipline = computed(() =>
  disciplinesQuery.data.value?.find(d => d.slug === disciplineSlug.value) ?? null,
)
const notFound = computed(() => disciplinesQuery.isSuccess.value && !discipline.value)

useSeoMeta({
  title: () => discipline.value?.name ?? t('training.steps.zone'),
})
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6 sm:space-y-8">
    <TrainingSteps :step="2" :discipline="discipline" />

    <UEmpty
      v-if="notFound"
      icon="i-lucide-search-x"
      :title="t('training.notFound.discipline')"
      :actions="[{ label: t('training.back'), icon: 'i-lucide-arrow-left', to: '/training' }]"
    />

    <template v-else>
      <div class="flex items-center gap-4">
        <div
          v-if="discipline"
          class="size-12 sm:size-14 shrink-0 rounded-2xl flex items-center justify-center"
          :class="disciplineAccent(discipline.slug)"
        >
          <UIcon :name="discipline.icon" class="size-6 sm:size-7" />
        </div>
        <USkeleton v-else class="size-12 sm:size-14 rounded-2xl" />
        <div class="space-y-1 min-w-0 flex-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
            {{ t('training.zone.title') }}
          </h1>
          <p class="text-muted">
            {{ t('training.zone.subtitle', { discipline: discipline?.name ?? '' }) }}
          </p>
        </div>
        <!-- Entrenamiento guiado combinando varias zonas -->
        <UButton
          class="hidden sm:inline-flex shrink-0"
          icon="i-lucide-play"
          :label="t('session.cta.multi')"
          :to="{ path: '/training/session/new', query: { discipline: disciplineSlug } }"
        />
      </div>
      <UButton
        class="sm:hidden"
        block
        icon="i-lucide-play"
        :label="t('session.cta.multi')"
        :to="{ path: '/training/session/new', query: { discipline: disciplineSlug } }"
      />

      <UAlert
        v-if="isError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="t('training.loadError')"
        :description="errorMessage"
      />

      <UEmpty
        v-else-if="!isPending && !zones?.length"
        icon="i-lucide-crosshair"
        :title="t('training.empty.zones')"
      />

      <div v-else class="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <template v-if="isPending">
          <USkeleton v-for="n in 8" :key="n" class="h-36 rounded-xl" />
        </template>
        <ZoneCard
          v-for="zone in zones"
          v-else
          :key="zone.id"
          :zone="zone"
          :discipline-slug="disciplineSlug"
        />
      </div>
    </template>
  </UContainer>
</template>
