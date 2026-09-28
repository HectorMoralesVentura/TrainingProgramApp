<script setup lang="ts">
import type { ExerciseLevelSpec } from '~/features/training/types/training.types'

const props = defineProps<{ spec: ExerciseLevelSpec }>()

const { t } = useI18n()

const amountLabel = computed(() =>
  props.spec.reps != null || props.spec.to_failure ? t('training.exercise.reps') : t('training.exercise.hold'),
)
const amount = computed(() => formatSpecAmount(props.spec, t('training.exercise.toFailureShort')))
</script>

<template>
  <dl class="grid grid-cols-3 gap-2">
    <div class="rounded-lg bg-elevated px-2 py-2 text-center">
      <dt class="text-[11px] uppercase tracking-wide text-muted">
        {{ t('training.exercise.sets') }}
      </dt>
      <dd class="text-lg font-semibold text-highlighted tabular-nums">
        {{ spec.sets }}
      </dd>
    </div>
    <div class="rounded-lg bg-elevated px-2 py-2 text-center">
      <dt class="text-[11px] uppercase tracking-wide text-muted">
        {{ amountLabel }}
      </dt>
      <dd class="text-lg font-semibold text-highlighted tabular-nums truncate">
        {{ amount }}
      </dd>
    </div>
    <div class="rounded-lg bg-elevated px-2 py-2 text-center">
      <dt class="text-[11px] uppercase tracking-wide text-muted">
        {{ t('training.exercise.rest') }}
      </dt>
      <dd class="text-lg font-semibold text-highlighted tabular-nums">
        {{ formatTrainingSeconds(spec.rest_seconds) }}
      </dd>
    </div>
  </dl>
</template>
