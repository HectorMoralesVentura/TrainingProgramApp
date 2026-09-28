<script setup lang="ts">
import type { ExerciseLevel } from '~/features/training/types/training.types'

const props = withDefaults(defineProps<{
  /** Tope por condición médica: los niveles superiores se deshabilitan. */
  maxLevel?: ExerciseLevel | null
  label?: string
}>(), {
  maxLevel: null,
  label: undefined,
})

const level = defineModel<ExerciseLevel>({ required: true })

const { t } = useI18n()

const items = computed(() =>
  TRAINING_LEVELS.map(l => ({
    label: t(`training.levels.${l.value}`),
    value: l.value,
    icon: isLevelAbove(l.value, props.maxLevel) ? 'i-lucide-lock' : l.icon,
    color: l.color,
    disabled: isLevelAbove(l.value, props.maxLevel),
  })),
)

const current = computed(() => trainingLevelMeta(level.value))
const labelText = computed(() => props.label ?? t('training.level.label'))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span class="text-xs font-medium text-muted">{{ labelText }}</span>

    <!-- Móvil: select compacto; tablet/escritorio: grupo de botones -->
    <USelect
      v-model="level"
      class="sm:hidden w-full"
      :items="items"
      :icon="current.icon"
      :aria-label="labelText"
    />
    <UFieldGroup class="hidden sm:flex" role="radiogroup" :aria-label="labelText">
      <UButton
        v-for="item in items"
        :key="item.value"
        role="radio"
        :aria-checked="level === item.value"
        :icon="item.icon"
        :label="item.label"
        :disabled="item.disabled"
        :color="level === item.value ? item.color : 'neutral'"
        :variant="level === item.value ? 'solid' : 'outline'"
        @click="level = item.value"
      />
    </UFieldGroup>
  </div>
</template>
