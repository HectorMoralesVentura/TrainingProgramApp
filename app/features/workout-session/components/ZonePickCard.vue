<script setup lang="ts">
import type { FocusZone } from '~/features/training/types/training.types'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

const props = defineProps<{ zone: FocusZone, selected: boolean, disabled?: boolean }>()
defineEmits<{ toggle: [] }>()

const { t } = useI18n()
const muscleMap = computed(() => zoneMuscleMap(props.zone.slug))
const imageFailed = ref(false)
const illustrationUrl = computed(() => (imageFailed.value ? null : props.zone.illustration_url ?? null))
</script>

<template>
  <!-- Tarjeta seleccionable (multi-selección de zonas) -->
  <button
    type="button"
    role="checkbox"
    :aria-checked="selected"
    :aria-label="zone.name"
    :disabled="disabled && !selected"
    class="group relative w-full rounded-xl text-left ring transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
    :class="selected ? 'ring-2 ring-primary bg-primary/5' : 'ring-default bg-default hover:ring-primary/50'"
    @click="$emit('toggle')"
  >
    <span
      class="absolute top-2.5 right-2.5 z-10 size-6 rounded-full flex items-center justify-center transition-colors"
      :class="selected ? 'bg-primary text-inverted' : 'bg-default ring ring-default text-transparent'"
    >
      <UIcon name="i-lucide-check" class="size-4" />
    </span>
    <div class="p-3 flex flex-col items-center gap-2 text-center">
      <div class="w-full h-28 sm:h-32 rounded-lg bg-elevated flex items-center justify-center p-2">
        <!-- img nativo: Nuxt UI no tiene componente de imagen -->
        <img v-if="illustrationUrl" :src="illustrationUrl" :alt="zone.name" class="h-full w-auto object-contain" @error="imageFailed = true">
        <MuscleMap v-else-if="muscleMap" :highlighted="muscleMap.muscles" :view="muscleMap.view" :region="muscleMap.region" class="h-full w-auto max-w-full" />
        <UIcon v-else name="i-lucide-crosshair" class="size-8 text-muted" />
      </div>
      <div>
        <p class="font-semibold text-highlighted">
          {{ zone.name }}
        </p>
        <p class="text-xs text-muted">
          {{ t('training.zone.exercises', zone.exercise_count) }}
        </p>
      </div>
    </div>
  </button>
</template>
