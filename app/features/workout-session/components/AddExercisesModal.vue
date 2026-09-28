<script setup lang="ts">
import type { Exercise } from '~/features/training/types/training.types'

const props = defineProps<{
  disciplineSlug: string
  /** Slugs que ya están en el plan (se muestran como agregados). */
  inPlan: string[]
}>()

const emit = defineEmits<{ add: [exercise: Exercise, zone: { slug: string, name: string }] }>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const { data: zones } = useDisciplineZones(() => props.disciplineSlug)
const zoneSlug = ref('')
watch(zones, (value) => {
  if (!zoneSlug.value && value?.length) zoneSlug.value = value[0]!.slug
}, { immediate: true })

const zone = computed(() => zones.value?.find(z => z.slug === zoneSlug.value) ?? null)
const zoneItems = computed(() => (zones.value ?? []).map(z => ({ label: z.name, value: z.slug })))

// TODO(backend): con /api/catalog/exercises/?zone= se podrán listar más de 6 por zona.
const { data: exercises, isPending, isError, errorMessage } = useZoneExercises(() => props.disciplineSlug, zoneSlug)
const inPlanSet = computed(() => new Set(props.inPlan))

function add(exercise: Exercise) {
  if (zone.value) emit('add', exercise, { slug: zone.value.slug, name: zone.value.name })
}
</script>

<template>
  <UModal v-model:open="open" :title="t('session.add.title')" :description="t('session.add.description')" :ui="{ content: 'sm:max-w-lg' }">
    <template #body>
      <div class="space-y-4">
        <UFormField :label="t('session.add.zone')">
          <USelect v-model="zoneSlug" :items="zoneItems" class="w-full" />
        </UFormField>

        <UAlert v-if="isError" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('training.loadError')" :description="errorMessage" />
        <div v-else-if="isPending" class="space-y-2">
          <USkeleton v-for="n in 4" :key="n" class="h-14 rounded-lg" />
        </div>
        <UEmpty v-else-if="!exercises?.length" icon="i-lucide-list-checks" :title="t('training.empty.exercises')" />
        <ul v-else class="divide-y divide-default rounded-lg ring ring-default">
          <li v-for="exercise in exercises" :key="exercise.id" class="flex items-center justify-between gap-3 px-3 py-2.5">
            <div class="min-w-0">
              <p class="font-medium text-highlighted truncate">
                {{ exercise.name }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ exercise.muscles.join(' · ') }}
              </p>
            </div>
            <UButton
              v-if="inPlanSet.has(exercise.slug)"
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-check"
              disabled
              :label="t('session.add.added')"
            />
            <UButton v-else size="sm" variant="soft" icon="i-lucide-plus" :label="t('session.add.add')" @click="add(exercise)" />
          </li>
        </ul>
      </div>
    </template>
    <template #footer>
      <UButton class="ml-auto" :label="t('session.add.done')" @click="open = false" />
    </template>
  </UModal>
</template>
