<script setup lang="ts">
import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import MediaPlaceholder from '~/features/training/components/MediaPlaceholder.vue'
import ExerciseStats from '~/features/training/components/ExerciseStats.vue'

const props = defineProps<{
  exercise: Exercise
  /** Nivel elegido para la disciplina; se limita con max_level del ejercicio. */
  level: ExerciseLevel
  index: number
}>()

defineEmits<{ open: [] }>()

const { t } = useI18n()

const effectiveLevel = computed(() => clampTrainingLevel(props.level, props.exercise.max_level))
const isLimited = computed(() => effectiveLevel.value !== props.level)
const spec = computed(() => levelSpec(props.exercise.levels, effectiveLevel.value))
const levelMeta = computed(() => trainingLevelMeta(effectiveLevel.value))
</script>

<template>
  <UCard
    class="h-full overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg"
    :ui="{ body: 'p-0 sm:p-0 flex-1 flex flex-col', footer: 'p-4 sm:px-4' }"
  >
    <MediaPlaceholder
      icon="i-lucide-image"
      :label="t('training.media.thumbnail')"
      :src="exercise.media.thumbnail_url"
      :alt="exercise.name"
    >
      <span class="absolute top-3 left-3 size-7 rounded-full bg-default/90 text-highlighted text-sm font-semibold flex items-center justify-center shadow-sm">
        {{ index }}
      </span>
      <UBadge
        class="absolute top-3 right-3"
        :color="levelMeta.color"
        :icon="isLimited ? 'i-lucide-lock' : levelMeta.icon"
        :label="t(`training.levels.${effectiveLevel}`)"
        size="sm"
      />
    </MediaPlaceholder>

    <div class="flex-1 flex flex-col gap-3 p-4">
      <div class="space-y-2">
        <h3 class="font-semibold text-highlighted leading-snug">
          {{ exercise.name }}
        </h3>
        <UBadge
          color="neutral"
          variant="subtle"
          size="sm"
          class="max-w-full"
          :icon="exercise.equipment ? 'i-lucide-dumbbell' : 'i-lucide-person-standing'"
          :label="exercise.equipment ?? t('training.exercise.bodyweight')"
        />
      </div>

      <UAlert
        v-if="exercise.restriction_note"
        color="warning"
        variant="subtle"
        icon="i-lucide-shield-alert"
        :title="isLimited ? t('training.restriction.limitedTo', { level: t(`training.levels.${effectiveLevel}`) }) : t('training.restriction.title')"
        :description="exercise.restriction_note"
        :ui="{ title: 'text-xs', description: 'text-xs line-clamp-2' }"
      />

      <ExerciseStats :spec="spec" />

      <!-- Peso sugerido: null en peso corporal o si el usuario aún no registra su peso -->
      <div v-if="exercise.equipment" class="flex items-center justify-between gap-2 text-sm">
        <span class="flex items-center gap-1.5 text-muted">
          <UIcon name="i-lucide-weight" class="size-4" />
          {{ t('training.exercise.suggestedWeight') }}
        </span>
        <span v-if="spec.suggested_weight_kg != null" class="font-semibold text-highlighted tabular-nums">
          {{ formatWeight(spec.suggested_weight_kg) }}
        </span>
        <UButton
          v-else
          to="/profile"
          size="xs"
          variant="link"
          trailing-icon="i-lucide-chevron-right"
          :label="t('training.exercise.registerWeight')"
        />
      </div>

      <div class="flex flex-wrap gap-1 mt-auto">
        <UBadge
          v-for="muscle in exercise.muscles.slice(0, 3)"
          :key="muscle"
          color="primary"
          variant="soft"
          size="sm"
          :label="muscle"
        />
      </div>
    </div>

    <template #footer>
      <UButton
        block
        variant="soft"
        trailing-icon="i-lucide-chevron-right"
        :label="t('training.exercise.viewDetail')"
        @click="$emit('open')"
      />
    </template>
  </UCard>
</template>
