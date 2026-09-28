<script setup lang="ts">
import type { MuscleId } from '~/features/training/utils/muscle-map.data'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { formatDate } = useDateFormat()
const workoutId = computed(() => Number(route.params.id) || null)

const { data: report, isPending, isError, errorMessage } = useWorkoutReport(workoutId)
const { data: disciplines } = useDisciplines()
const discipline = computed(() => disciplines.value?.find(d => d.slug === report.value?.discipline) ?? null)

// Músculos de las zonas trabajadas (mismo mapa que las tarjetas de zona).
const worked = computed<MuscleId[]>(() => {
  const ids = new Set<MuscleId>()
  for (const zone of report.value?.zones ?? []) {
    if (!zone.sets_done) continue
    for (const id of zoneMuscleMap(zone.slug)?.muscles ?? []) ids.add(id)
  }
  return [...ids]
})

const zoneName = (slug: string) => report.value?.zones.find(z => z.slug === slug)?.name ?? slug
const durationDiff = computed(() => (report.value ? report.value.duration_seconds - report.value.estimated_duration_seconds : 0))
const workShare = computed(() => {
  const r = report.value
  if (!r) return 0
  const total = r.totals.work_seconds + r.totals.rest_seconds
  return total ? Math.round((r.totals.work_seconds / total) * 100) : 0
})

function plannedLabel(e: NonNullable<typeof report.value>['exercises'][number]) {
  const p = e.planned
  if (p.to_failure) return `${p.sets} × ${t('training.exercise.toFailureShort')}`
  if (p.reps == null) return `${p.sets} × ${formatClock(p.duration_seconds ?? 0)}`
  return `${p.sets} × ${p.reps}`
}

useSeoMeta({ title: () => t('session.report.title') })
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6">
    <div class="flex items-center gap-2">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" to="/workouts" :aria-label="t('training.back')" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-primary">
          {{ discipline?.name ?? report?.discipline }}
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
          {{ t('session.report.title') }}
        </h1>
        <p v-if="report" class="text-sm text-muted">
          {{ formatDate(report.started_at, { dateStyle: 'full', timeStyle: 'short' }) }}
        </p>
      </div>
      <UBadge
        v-if="report && report.status !== 'completed'"
        class="ms-auto"
        :color="report.status === 'in_progress' ? 'info' : 'neutral'"
        variant="subtle"
        :label="t(`session.status.${report.status}`)"
      />
    </div>

    <UAlert v-if="isError" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('session.report.loadError')" :description="errorMessage" />

    <div v-else-if="isPending" class="space-y-4">
      <USkeleton class="h-28 rounded-xl" />
      <USkeleton class="h-64 rounded-xl" />
    </div>

    <template v-else-if="report">
      <!-- Totales -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div class="rounded-xl bg-elevated p-3 sm:p-4">
          <p class="text-xs text-muted">
            {{ t('session.report.duration') }}
          </p>
          <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
            {{ formatClock(report.duration_seconds) }}
          </p>
          <p class="text-xs" :class="durationDiff > 0 ? 'text-warning' : 'text-success'">
            {{ t('session.report.vsEstimated', { time: formatClock(report.estimated_duration_seconds) }) }}
          </p>
        </div>
        <div class="rounded-xl bg-elevated p-3 sm:p-4 space-y-2">
          <p class="text-xs text-muted">
            {{ t('session.report.completion') }}
          </p>
          <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
            {{ report.totals.completion_pct }} %
          </p>
          <UProgress :model-value="report.totals.completion_pct" size="sm" />
        </div>
        <div class="rounded-xl bg-elevated p-3 sm:p-4">
          <p class="text-xs text-muted">
            {{ t('session.summary.volume') }}
          </p>
          <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
            {{ formatWeight(report.totals.volume_kg) }}
          </p>
          <p class="text-xs text-muted">
            {{ t('session.report.setsReps', { sets: report.totals.sets_done, planned: report.totals.sets_planned, reps: report.totals.reps_done }) }}
          </p>
        </div>
        <div class="rounded-xl bg-elevated p-3 sm:p-4 space-y-2">
          <p class="text-xs text-muted">
            {{ t('session.report.workVsRest') }}
          </p>
          <div class="flex justify-between text-sm tabular-nums">
            <span class="text-primary font-semibold">{{ formatClock(report.totals.work_seconds) }}</span>
            <span class="text-info font-semibold">{{ formatClock(report.totals.rest_seconds) }}</span>
          </div>
          <!-- Barra dividida: trabajo (primario) vs descanso (info) -->
          <div class="h-2 w-full rounded-full bg-info/30 overflow-hidden" :aria-label="t('session.report.workShare', { pct: workShare })">
            <div class="h-full bg-primary" :style="{ width: `${workShare}%` }" />
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div class="space-y-6 min-w-0">
          <!-- Por zona -->
          <section class="space-y-3">
            <h2 class="font-semibold text-highlighted">
              {{ t('session.report.byZone') }}
            </h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <UCard v-for="zone in report.zones" :key="zone.slug" :ui="{ body: 'p-4 sm:p-4' }">
                <p class="font-medium text-highlighted">
                  {{ zone.name }}
                </p>
                <p class="text-sm text-muted">
                  {{ t('session.report.zoneStats', { exercises: zone.exercises, sets: zone.sets_done, reps: zone.reps_done }) }}
                </p>
                <p v-if="zone.volume_kg" class="text-sm font-semibold text-highlighted tabular-nums">
                  {{ formatWeight(zone.volume_kg) }}
                </p>
              </UCard>
            </div>
          </section>

          <!-- Por ejercicio -->
          <section class="space-y-3">
            <h2 class="font-semibold text-highlighted">
              {{ t('session.summary.exercises') }}
            </h2>
            <div class="rounded-lg ring ring-default overflow-x-auto">
              <!-- table nativa: tabla de solo lectura con pocas filas; UTable sería excesivo -->
              <table class="w-full min-w-[40rem] text-sm">
                <thead class="bg-elevated text-xs text-muted">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium">
                      {{ t('session.report.exercise') }}
                    </th>
                    <th class="px-3 py-2 text-left font-medium">
                      {{ t('session.report.planned') }}
                    </th>
                    <th class="px-3 py-2 text-center font-medium">
                      {{ t('session.report.done') }}
                    </th>
                    <th class="px-3 py-2 text-center font-medium">
                      {{ t('session.report.maxWeight') }}
                    </th>
                    <th class="px-3 py-2 text-center font-medium">
                      {{ t('session.summary.volume') }}
                    </th>
                    <th class="px-3 py-2 text-center font-medium">
                      {{ t('session.report.workRest') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in report.exercises" :key="e.id" class="border-t border-default">
                    <td class="px-3 py-2.5">
                      <div class="flex items-center gap-2">
                        <UIcon
                          :name="e.completed ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'"
                          class="size-4 shrink-0"
                          :class="e.completed ? 'text-success' : 'text-muted'"
                        />
                        <div class="min-w-0">
                          <p class="font-medium text-highlighted">
                            {{ e.exercise.name }}
                          </p>
                          <p class="text-xs text-muted">
                            {{ zoneName(e.zone) }} · {{ t(`training.levels.${e.level}`) }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 tabular-nums">
                      {{ plannedLabel(e) }}
                    </td>
                    <td class="px-3 text-center tabular-nums">
                      {{ e.sets_done }}/{{ e.sets_planned }}
                      <span v-if="e.reps_done" class="text-xs text-muted"> · {{ t('session.report.reps', { n: e.reps_done }) }}</span>
                    </td>
                    <td class="px-3 text-center tabular-nums">
                      <template v-if="e.max_weight_kg != null">
                        {{ formatWeight(e.max_weight_kg) }}
                        <span
                          v-if="e.suggested_weight_kg != null"
                          class="block text-xs"
                          :class="e.max_weight_kg >= e.suggested_weight_kg ? 'text-success' : 'text-muted'"
                        >
                          {{ t('session.report.suggested', { w: formatWeight(e.suggested_weight_kg) }) }}
                        </span>
                      </template>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td class="px-3 text-center tabular-nums">
                      {{ e.volume_kg ? formatWeight(e.volume_kg) : '—' }}
                    </td>
                    <td class="px-3 text-center tabular-nums text-xs">
                      <span class="text-primary">{{ formatClock(e.work_seconds) }}</span> / <span class="text-info">{{ formatClock(e.rest_seconds) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside class="space-y-4">
          <UCard :ui="{ body: 'p-4 sm:p-4 space-y-3' }">
            <h2 class="font-semibold text-highlighted">
              {{ t('session.summary.muscles') }}
            </h2>
            <div class="h-56 flex items-center justify-center rounded-lg bg-elevated p-2">
              <MuscleMap :highlighted="worked" class="h-full w-auto max-w-full" />
            </div>
          </UCard>
          <UCard v-if="report.perceived_effort || report.notes" :ui="{ body: 'p-4 sm:p-4 space-y-2' }">
            <UBadge v-if="report.perceived_effort" color="primary" variant="subtle" icon="i-lucide-gauge" :label="t('progress.workouts.effortValue', { n: report.perceived_effort })" />
            <p v-if="report.notes" class="text-sm text-muted">
              {{ report.notes }}
            </p>
          </UCard>
          <UButton v-if="report.status === 'in_progress'" block icon="i-lucide-play" :label="t('session.cta.continue')" to="/training/session" />
          <UButton v-else block variant="outline" icon="i-lucide-dumbbell" :label="t('training.home.cta')" to="/training" />
        </aside>
      </div>
    </template>
  </UContainer>
</template>
