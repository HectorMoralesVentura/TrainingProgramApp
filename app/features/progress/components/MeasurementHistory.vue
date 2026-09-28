<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Measurement } from '~/features/progress/types/progress.types'
import { API_PAGE_SIZE } from '~/shared/types/api.types'

const { t } = useI18n()
const { formatDate } = useDateFormat()

const page = ref(1)
const { data, isPending, isError, errorMessage, isPlaceholderData } = useMeasurements(page)

const latest = computed(() => (page.value === 1 ? data.value?.results[0] ?? null : null))

function cm(value: number | null) {
  return value != null ? `${value} cm` : '—'
}

const columns = computed<TableColumn<Measurement>[]>(() => [
  { accessorKey: 'measured_at', header: t('progress.measurements.date'), cell: ({ row }) => formatDate(row.original.measured_at) },
  { accessorKey: 'weight_kg', header: t('progress.measurements.weight'), cell: ({ row }) => formatWeight(row.original.weight_kg) },
  { accessorKey: 'body_fat_pct', header: t('progress.measurements.bodyFat'), cell: ({ row }) => (row.original.body_fat_pct != null ? `${row.original.body_fat_pct}%` : '—') },
  { accessorKey: 'height_cm', header: t('progress.measurements.height'), cell: ({ row }) => cm(row.original.height_cm) },
  { accessorKey: 'waist_cm', header: t('progress.measurements.fields.waist_cm'), cell: ({ row }) => cm(row.original.waist_cm) },
  { accessorKey: 'chest_cm', header: t('progress.measurements.fields.chest_cm'), cell: ({ row }) => cm(row.original.chest_cm) },
  { accessorKey: 'arm_cm', header: t('progress.measurements.fields.arm_cm'), cell: ({ row }) => cm(row.original.arm_cm) },
])
</script>

<template>
  <div class="space-y-4">
    <!-- Resumen de la medida vigente (la más reciente) -->
    <div v-if="latest" class="grid grid-cols-3 gap-2 sm:gap-3">
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('progress.measurements.weight') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ formatWeight(latest.weight_kg) }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('progress.measurements.bodyFat') }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-highlighted tabular-nums">
          {{ latest.body_fat_pct != null ? `${latest.body_fat_pct}%` : '—' }}
        </p>
      </div>
      <div class="rounded-xl bg-elevated p-3 sm:p-4">
        <p class="text-xs text-muted">
          {{ t('progress.measurements.lastUpdate') }}
        </p>
        <p class="text-sm sm:text-base font-semibold text-highlighted">
          {{ formatDate(latest.measured_at) }}
        </p>
      </div>
    </div>

    <UAlert
      v-if="isError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('progress.measurements.loadError')"
      :description="errorMessage"
    />

    <UEmpty
      v-else-if="!isPending && !data?.count"
      icon="i-lucide-ruler"
      :title="t('progress.measurements.empty')"
      :description="t('progress.measurements.emptyDescription')"
    />

    <template v-else>
      <UTable
        :data="data?.results ?? []"
        :columns="columns"
        :loading="isPending || isPlaceholderData"
        class="rounded-lg ring ring-default"
      />
      <div v-if="(data?.count ?? 0) > API_PAGE_SIZE" class="flex justify-center">
        <UPagination v-model:page="page" :total="data?.count ?? 0" :items-per-page="API_PAGE_SIZE" />
      </div>
    </template>
  </div>
</template>
