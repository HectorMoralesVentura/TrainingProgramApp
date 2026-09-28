<script setup lang="ts">
import type { UserCondition } from '~/features/health/types/health.types'

const { t } = useI18n()
const { formatDate } = useDateFormat()

const { data: myConditions, isPending, isError, errorMessage } = useMyConditions()
const { mutateAsync: deleteCondition, isPending: isDeleting } = useDeleteMyCondition()

const toDelete = ref<UserCondition | null>(null)
const confirmOpen = computed({
  get: () => toDelete.value != null,
  set: (value) => {
    if (!value) toDelete.value = null
  },
})

async function confirmDelete() {
  if (!toDelete.value) return
  try {
    await deleteCondition(toDelete.value.id)
  } finally {
    toDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <UAlert
      v-if="isError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('health.myConditions.loadError')"
      :description="errorMessage"
    />

    <template v-else-if="isPending">
      <USkeleton v-for="n in 2" :key="n" class="h-24 rounded-xl" />
    </template>

    <UEmpty
      v-else-if="!myConditions?.length"
      icon="i-lucide-heart-pulse"
      :title="t('health.myConditions.empty')"
      :description="t('health.myConditions.emptyDescription')"
    />

    <UCard
      v-for="item in myConditions"
      v-else
      :key="item.id"
      :ui="{ body: 'p-4 sm:p-4 flex gap-3' }"
    >
      <div class="size-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <UIcon :name="conditionCategoryIcon(item.condition.category)" class="size-5" />
      </div>

      <div class="flex-1 min-w-0 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-semibold text-highlighted">
            {{ item.condition.name }}
          </h3>
          <UBadge
            size="sm"
            variant="subtle"
            :color="conditionSeverityColor(item.severity)"
            :label="t(`health.severities.${item.severity}`)"
          />
          <UBadge size="sm" variant="outline" color="neutral" :label="t(`health.categories.${item.condition.category}`)" />
        </div>
        <p v-if="item.notes" class="text-sm text-muted">
          {{ item.notes }}
        </p>
        <p v-if="item.started_at" class="text-xs text-muted">
          {{ t('health.myConditions.since', { date: formatDate(item.started_at) }) }}
        </p>
        <div v-if="item.affected_zones.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="zone in item.affected_zones"
            :key="zone.id"
            size="sm"
            color="warning"
            variant="soft"
            icon="i-lucide-ban"
            :label="zone.name"
          />
        </div>
      </div>

      <UButton
        class="self-start"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        :aria-label="t('health.myConditions.delete', { name: item.condition.name })"
        @click="toDelete = item"
      />
    </UCard>

    <UModal
      v-model:open="confirmOpen"
      :title="t('health.myConditions.confirmTitle')"
      :description="t('health.myConditions.confirmDescription', { name: toDelete?.condition.name ?? '' })"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" :label="t('common.cancel')" @click="confirmOpen = false" />
          <UButton color="error" icon="i-lucide-trash-2" :loading="isDeleting" :label="t('common.delete')" @click="confirmDelete" />
        </div>
      </template>
    </UModal>
  </div>
</template>
