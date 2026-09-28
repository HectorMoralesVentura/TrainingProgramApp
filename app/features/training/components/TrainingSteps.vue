<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const props = defineProps<{
  step: 1 | 2 | 3
  discipline?: { slug: string, name: string } | null
  zone?: { name: string } | null
}>()

const { t } = useI18n()

const items = computed<BreadcrumbItem[]>(() => {
  const list: BreadcrumbItem[] = [
    { label: t('training.steps.discipline'), icon: 'i-lucide-layers', to: '/training' },
  ]
  if (props.step >= 2) {
    list.push({
      label: props.discipline?.name ?? t('training.steps.zone'),
      to: props.discipline ? `/training/${props.discipline.slug}` : undefined,
    })
  }
  if (props.step >= 3) {
    list.push({ label: props.zone?.name ?? t('training.steps.exercises') })
  }
  return list
})

const backTo = computed(() => {
  if (props.step === 3 && props.discipline) return `/training/${props.discipline.slug}`
  if (props.step === 2) return '/training'
  return '/'
})
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 min-w-0">
      <!-- En móvil el breadcrumb se reemplaza por un botón de regreso -->
      <UButton
        class="sm:hidden shrink-0"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        :to="backTo"
        :aria-label="t('training.back')"
      />
      <UBreadcrumb class="hidden sm:flex min-w-0" :items="items" />
      <span class="sm:hidden truncate text-sm font-medium text-highlighted">
        {{ items[items.length - 1]?.label }}
      </span>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <span class="text-xs text-muted">{{ t('training.stepOf', { current: step, total: 3 }) }}</span>
      <div class="flex gap-1" aria-hidden="true">
        <span
          v-for="n in 3"
          :key="n"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="n <= step ? 'w-5 bg-primary' : 'w-1.5 bg-accented'"
        />
      </div>
    </div>
  </div>
</template>
