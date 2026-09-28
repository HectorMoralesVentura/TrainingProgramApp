<script setup lang="ts">
import TrainingSteps from '~/features/training/components/TrainingSteps.vue'
import DisciplineCard from '~/features/training/components/DisciplineCard.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { data: disciplines, isPending, isError, errorMessage } = useDisciplines()

useSeoMeta({
  title: () => t('training.discipline.title'),
})
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6 sm:space-y-8">
    <TrainingSteps :step="1" />

    <div class="space-y-1">
      <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
        {{ t('training.discipline.title') }}
      </h1>
      <p class="text-muted">
        {{ t('training.discipline.subtitle') }}
      </p>
    </div>

    <UAlert
      v-if="isError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('training.loadError')"
      :description="errorMessage"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <template v-if="isPending">
        <USkeleton v-for="n in 3" :key="n" class="h-52 rounded-xl" />
      </template>
      <DisciplineCard
        v-for="discipline in disciplines"
        v-else
        :key="discipline.id"
        :discipline="discipline"
      />
    </div>
  </UContainer>
</template>
