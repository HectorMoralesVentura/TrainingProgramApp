<script setup lang="ts">
import type { WorkoutSummaryFilters } from '~/features/workout-session/types/workout.types'

const props = defineProps<{ filters: WorkoutSummaryFilters }>()

const { t } = useI18n()
const { data: summary, isPending, isError } = useWorkoutSummary(() => props.filters)

const topZones = computed(() => (summary.value?.zones ?? []).slice(0, 5))
const maxZoneSets = computed(() => Math.max(1, ...topZones.value.map(z => z.sets_done)))
</script>

<template>
  <!-- El resumen es informativo: si falla o no hay sesiones terminadas, no se muestra -->
  <section v-if="isPending" class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
    <USkeleton v-for="n in 4" :key="n" class="h-20 rounded-xl" />
  </section>

  <section v-else-if="!isError && summary && summary.totals.sessions" class="space-y-3">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.stats.sessions') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ summary.totals.sessions }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.stats.time') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ formatDuration(summary.totals.duration_seconds, t) }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.stats.setsReps') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ summary.totals.sets_done }} <span class="text-sm font-normal text-muted">/ {{ summary.totals.reps_done }}</span>
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('session.summary.volume') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ formatWeight(summary.totals.volume_kg) }}
        </p>
      </div>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <UCard :ui="{ body: 'p-4 sm:p-4 space-y-3' }">
        <h2 class="text-sm font-semibold text-highlighted">
          {{ t('session.stats.zones') }}
        </h2>
        <div v-for="zone in topZones" :key="zone.slug" class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="text-highlighted">{{ zone.name }}</span>
            <span class="text-muted tabular-nums">{{ t('session.stats.zoneLine', { sessions: zone.sessions, sets: zone.sets_done }) }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-accented overflow-hidden">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${(zone.sets_done / maxZoneSets) * 100}%` }" />
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-4 sm:p-4 space-y-2' }">
        <h2 class="text-sm font-semibold text-highlighted">
          {{ t('session.stats.topExercises') }}
        </h2>
        <ol class="space-y-1.5">
          <li v-for="(e, i) in summary.top_exercises.slice(0, 5)" :key="e.slug" class="flex items-center gap-2 text-sm">
            <span class="size-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">{{ i + 1 }}</span>
            <span class="flex-1 min-w-0 truncate text-highlighted">{{ e.name }}</span>
            <span class="text-muted tabular-nums">{{ t('session.stats.times', { n: e.times }) }}</span>
            <UBadge v-if="e.best_weight_kg" size="sm" color="neutral" variant="subtle" icon="i-lucide-trophy" :label="formatWeight(e.best_weight_kg)" />
          </li>
        </ol>
      </UCard>
    </div>
  </section>
</template>
