<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import MeasurementForm from '~/features/progress/components/MeasurementForm.vue'
import MeasurementHistory from '~/features/progress/components/MeasurementHistory.vue'
import ConditionForm from '~/features/health/components/ConditionForm.vue'
import MyConditionsList from '~/features/health/components/MyConditionsList.vue'
import ProfilePhotoUploader from '~/features/profile/components/ProfilePhotoUploader.vue'
import ProgressPhotos from '~/features/progress/components/ProgressPhotos.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// La pestaña vive en la URL (?tab=health) para poder enlazar directo a ella.
const TABS = ['measurements', 'photos', 'health']
const tab = computed({
  get: () => (TABS.includes(route.query.tab as string) ? String(route.query.tab) : 'measurements'),
  set: value => router.replace({ query: { ...route.query, tab: value === 'measurements' ? undefined : String(value) } }),
})

const tabs = computed<TabsItem[]>(() => [
  { label: t('profile.tabs.measurements'), icon: 'i-lucide-ruler', value: 'measurements', slot: 'measurements' as const },
  { label: t('profile.tabs.photos'), icon: 'i-lucide-images', value: 'photos', slot: 'photos' as const },
  { label: t('profile.tabs.health'), icon: 'i-lucide-heart-pulse', value: 'health', slot: 'health' as const },
])

useSeoMeta({
  title: () => t('profile.title'),
})
</script>

<template>
  <UContainer class="py-4 sm:py-8 space-y-6">
    <div class="flex items-center gap-4">
      <ProfilePhotoUploader />
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted truncate">
          {{ t('profile.title') }}
        </h1>
        <p class="text-muted">
          {{ t('profile.subtitle') }}
        </p>
      </div>
    </div>

    <UTabs v-model="tab" :items="tabs" class="w-full" :ui="{ list: 'sm:w-fit' }">
      <template #measurements>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] pt-4">
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">
                {{ t('progress.measurements.formTitle') }}
              </h2>
              <p class="text-sm text-muted">
                {{ t('progress.measurements.formDescription') }}
              </p>
            </template>
            <MeasurementForm />
          </UCard>
          <section class="space-y-3 min-w-0">
            <h2 class="font-semibold text-highlighted">
              {{ t('progress.measurements.historyTitle') }}
            </h2>
            <MeasurementHistory />
          </section>
        </div>
      </template>

      <template #photos>
        <div class="pt-4">
          <ProgressPhotos />
        </div>
      </template>

      <template #health>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] pt-4">
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">
                {{ t('health.form.title') }}
              </h2>
              <p class="text-sm text-muted">
                {{ t('health.form.description') }}
              </p>
            </template>
            <ConditionForm />
          </UCard>
          <section class="space-y-3 min-w-0">
            <h2 class="font-semibold text-highlighted">
              {{ t('health.myConditions.title') }}
            </h2>
            <MyConditionsList />
          </section>
        </div>
      </template>
    </UTabs>
  </UContainer>
</template>
