<script setup lang="ts">
import ZonePickCard from '~/features/workout-session/components/ZonePickCard.vue'

definePageMeta({ middleware: 'auth' })

const MAX_ZONES = 6

const { t } = useI18n()
const route = useRoute()
const disciplineSlug = computed(() => String(route.query.discipline ?? ''))

if (!disciplineSlug.value) await navigateTo('/training')

const { data: disciplines } = useDisciplines()
const { data: zones, isPending, isError, errorMessage } = useDisciplineZones(disciplineSlug)
const { data: current } = useCurrentWorkout()
const discipline = computed(() => disciplines.value?.find(d => d.slug === disciplineSlug.value) ?? null)

// Zonas preseleccionadas desde la URL (?zones=chest,triceps), p. ej. al venir de una zona.
const selected = ref<string[]>(String(route.query.zones ?? '').split(',').filter(Boolean).slice(0, MAX_ZONES))
const perZone = ref(4)
const perZoneItems = [1, 2, 3, 4, 5, 6].map(n => ({ label: String(n), value: n }))

function toggle(slug: string) {
  selected.value = selected.value.includes(slug)
    ? selected.value.filter(s => s !== slug)
    : selected.value.length < MAX_ZONES ? [...selected.value, slug] : selected.value
}

const suggest = useWorkoutSuggest()
const draft = useWorkoutPlanDraft()

async function onSuggest() {
  if (!discipline.value || !selected.value.length) return
  try {
    const plan = await suggest.mutateAsync({ discipline: disciplineSlug.value, zones: selected.value, exercises_per_zone: perZone.value })
    draft.setFromSuggestion({ slug: discipline.value.slug, name: discipline.value.name }, plan)
    await navigateTo('/training/session/plan')
  } catch {
    // El toast de error lo muestra la mutación.
  }
}

useSeoMeta({ title: () => t('session.zones.title') })
</script>

<template>
  <UContainer class="py-4 sm:py-8 pb-32 space-y-6">
    <div class="flex items-center gap-2">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" :to="`/training/${disciplineSlug}`" :aria-label="t('training.back')" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-primary">
          {{ discipline?.name }}
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
          {{ t('session.zones.title') }}
        </h1>
      </div>
    </div>
    <p class="text-muted -mt-3">
      {{ t('session.zones.subtitle', { max: MAX_ZONES }) }}
    </p>

    <UAlert
      v-if="current"
      color="info"
      variant="subtle"
      icon="i-lucide-activity"
      :title="t('session.cta.runningTitle')"
      :description="t('session.cta.runningDescription')"
      :actions="[{ label: t('session.cta.continue'), icon: 'i-lucide-play', to: '/training/session' }]"
    />

    <UAlert v-if="isError" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('training.loadError')" :description="errorMessage" />

    <div v-else class="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      <template v-if="isPending">
        <USkeleton v-for="n in 8" :key="n" class="h-48 rounded-xl" />
      </template>
      <ZonePickCard
        v-for="zone in zones"
        v-else
        :key="zone.id"
        :zone="zone"
        :selected="selected.includes(zone.slug)"
        :disabled="selected.length >= MAX_ZONES"
        @toggle="toggle(zone.slug)"
      />
    </div>

    <!-- Barra fija: cuántos por zona + pedir sugerencia -->
    <div class="fixed inset-x-0 bottom-0 z-10 border-t border-default bg-default/90 backdrop-blur">
      <UContainer class="py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <UFormField :label="t('session.zones.perZone')" class="w-32">
            <USelect v-model="perZone" :items="perZoneItems" class="w-full" />
          </UFormField>
          <p class="text-sm text-muted hidden sm:block">
            {{ t('session.zones.selected', selected.length) }}
          </p>
        </div>
        <UButton
          size="xl"
          icon="i-lucide-sparkles"
          :disabled="!selected.length"
          :loading="suggest.isPending.value"
          :label="t('session.zones.suggest')"
          @click="onSuggest"
        />
      </UContainer>
    </div>
  </UContainer>
</template>
