<script setup lang="ts">
import type { FocusZone } from '~/features/training/types/training.types'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

const props = defineProps<{ zone: FocusZone, disciplineSlug: string }>()

const { t } = useI18n()

const muscleMap = computed(() => zoneMuscleMap(props.zone.slug))

// Si la imagen de Firebase no carga, se vuelve al mapa dibujado.
const imageFailed = ref(false)
const illustrationUrl = computed(() => (imageFailed.value ? null : props.zone.illustration_url ?? null))
</script>

<template>
  <ULink
    :to="`/training/${disciplineSlug}/${zone.slug}`"
    class="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <UCard
      class="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-primary/50"
      :ui="{ body: 'flex flex-col items-center text-center gap-3 p-3 sm:p-4' }"
    >
      <!-- Imagen de la zona (Firebase); si aún no hay, el mapa dibujado; zonas desconocidas usan el ícono -->
      <div
        v-if="illustrationUrl || muscleMap"
        class="w-full h-32 sm:h-40 rounded-lg bg-elevated flex items-center justify-center p-2 transition-colors duration-200 group-hover:bg-primary/5"
      >
        <!-- img nativo: Nuxt UI no tiene componente de imagen -->
        <img
          v-if="illustrationUrl"
          :src="illustrationUrl"
          :alt="zone.name"
          loading="lazy"
          class="h-full w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          @error="imageFailed = true"
        >
        <MuscleMap
          v-else-if="muscleMap"
          :highlighted="muscleMap.muscles"
          :view="muscleMap.view"
          :region="muscleMap.region"
          class="h-full w-auto max-w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div
        v-else
        class="size-12 sm:size-14 rounded-full flex items-center justify-center"
        :class="disciplineAccent(disciplineSlug)"
      >
        <UIcon name="i-lucide-crosshair" class="size-6 sm:size-7" />
      </div>

      <div class="space-y-0.5">
        <h2 class="font-semibold text-highlighted">
          {{ zone.name }}
        </h2>
        <p class="text-xs text-muted">
          {{ t('training.zone.exercises', zone.exercise_count) }}
        </p>
      </div>
    </UCard>
  </ULink>
</template>
