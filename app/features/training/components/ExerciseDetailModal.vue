<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { Exercise, ExerciseLevel } from '~/features/training/types/training.types'
import MediaPlaceholder from '~/features/training/components/MediaPlaceholder.vue'
import LevelSelector from '~/features/training/components/LevelSelector.vue'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

const props = defineProps<{
  exercise: Exercise | null
  /** Nivel de la disciplina; se limita con max_level del ejercicio. */
  level: ExerciseLevel
}>()

const emit = defineEmits<{ register: [exercise: Exercise, level: ExerciseLevel] }>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

// En teléfono el detalle ocupa toda la pantalla.
const isMobile = useMediaQuery('(max-width: 639px)')

// Nivel que se está viendo en el detalle; arranca en el nivel efectivo cada vez que se abre.
const viewLevel = ref<ExerciseLevel>('beginner')
watch(
  () => [open.value, props.exercise?.id] as const,
  ([isOpen]) => {
    if (isOpen && props.exercise) viewLevel.value = clampTrainingLevel(props.level, props.exercise.max_level)
  },
  { immediate: true },
)

const steps = computed(() =>
  (props.exercise?.instructions ?? '').split('\n').map(s => s.trim()).filter(Boolean),
)

const viewSpec = computed(() => (props.exercise ? levelSpec(props.exercise.levels, viewLevel.value) : null))

const highlightedMuscles = computed(() => muscleIdsFromNames(props.exercise?.muscles ?? []))

const hasWeight = computed(() => props.exercise?.levels.some(l => l.suggested_weight_kg != null) ?? false)
const isHold = computed(() => props.exercise?.levels.every(l => l.reps == null && !l.to_failure) ?? false)

const mediaTabs = computed<(TabsItem & { src: string | null })[]>(() => [
  { label: t('training.media.gif'), icon: 'i-lucide-repeat', value: 'gif', src: props.exercise?.media.gif_url ?? null },
  { label: t('training.media.video'), icon: 'i-lucide-play', value: 'video', src: null },
  { label: t('training.media.illustration'), icon: 'i-lucide-scan-eye', value: 'illustration', src: props.exercise?.media.illustration_url ?? null },
])

function register() {
  if (!props.exercise) return
  emit('register', props.exercise, viewLevel.value)
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="exercise?.name"
    :description="exercise?.equipment ?? t('training.exercise.bodyweight')"
    :fullscreen="isMobile"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template v-if="exercise" #body>
      <div class="space-y-6">
        <UTabs :items="mediaTabs" default-value="gif" variant="link" class="w-full">
          <template #content="{ item }">
            <div class="rounded-lg overflow-hidden ring ring-default">
              <!-- Sin ilustración subida: se dibuja el mapa muscular con los músculos del ejercicio -->
              <div
                v-if="item.value === 'illustration' && !exercise.media.illustration_url"
                class="aspect-video flex items-center justify-center bg-elevated p-3"
              >
                <MuscleMap :highlighted="highlightedMuscles" class="h-full w-auto" />
              </div>
              <!-- El video puede ser externo (YouTube/Vimeo) o archivo; se abre en otra pestaña -->
              <MediaPlaceholder
                v-else-if="item.value !== 'video' || !exercise.media.video_url"
                :icon="item.icon ?? 'i-lucide-image'"
                :label="t('training.media.pending')"
                :src="item.src"
                :alt="exercise.name"
              />
              <div v-else class="aspect-video flex items-center justify-center bg-elevated">
                <UButton
                  :to="exercise.media.video_url"
                  target="_blank"
                  icon="i-lucide-play"
                  size="lg"
                  :label="t('training.media.watchVideo')"
                />
              </div>
            </div>
          </template>
        </UTabs>

        <UAlert
          v-if="exercise.restriction_note"
          color="warning"
          variant="subtle"
          icon="i-lucide-shield-alert"
          :title="exercise.max_level
            ? t('training.restriction.maxLevel', { level: t(`training.levels.${exercise.max_level}`) })
            : t('training.restriction.title')"
          :description="exercise.restriction_note"
        />

        <LevelSelector v-model="viewLevel" :max-level="exercise.max_level" />

        <section class="space-y-2">
          <h3 class="text-sm font-semibold text-highlighted">
            {{ t('training.exercise.byLevel') }}
          </h3>
          <div class="rounded-lg ring ring-default overflow-x-auto text-sm">
            <!-- table nativa: son 4 filas fijas; UTable (TanStack Table) sería excesivo aquí -->
            <table class="w-full min-w-[22rem]">
              <thead class="bg-elevated text-xs text-muted">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">
                    {{ t('training.level.label') }}
                  </th>
                  <th class="px-2 py-2 text-center font-medium">
                    {{ t('training.exercise.sets') }}
                  </th>
                  <th class="px-2 py-2 text-center font-medium">
                    {{ isHold ? t('training.exercise.hold') : t('training.exercise.reps') }}
                  </th>
                  <th class="px-2 py-2 text-center font-medium">
                    {{ t('training.exercise.rest') }}
                  </th>
                  <th v-if="hasWeight" class="px-2 py-2 text-center font-medium">
                    {{ t('training.exercise.weight') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="spec in exercise.levels"
                  :key="spec.level"
                  class="border-t border-default transition-colors"
                  :class="[
                    spec.level === viewLevel && 'bg-primary/10',
                    isLevelAbove(spec.level, exercise.max_level) && 'opacity-45',
                  ]"
                  :aria-current="spec.level === viewLevel ? 'true' : undefined"
                >
                  <td class="px-3 py-2.5">
                    <UBadge
                      :color="trainingLevelMeta(spec.level).color"
                      :variant="spec.level === viewLevel ? 'solid' : 'subtle'"
                      :icon="isLevelAbove(spec.level, exercise.max_level) ? 'i-lucide-lock' : trainingLevelMeta(spec.level).icon"
                      :label="t(`training.levels.${spec.level}`)"
                      size="sm"
                    />
                  </td>
                  <td class="px-2 text-center tabular-nums">
                    {{ spec.sets }}
                  </td>
                  <td class="px-2 text-center tabular-nums">
                    {{ formatSpecAmount(spec, t('training.exercise.toFailureShort')) }}
                  </td>
                  <td class="px-2 text-center tabular-nums">
                    {{ formatTrainingSeconds(spec.rest_seconds) }}
                  </td>
                  <td v-if="hasWeight" class="px-2 text-center tabular-nums">
                    {{ spec.suggested_weight_kg != null ? formatWeight(spec.suggested_weight_kg) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="viewSpec?.to_failure" class="text-xs text-muted">
            {{ t('training.exercise.toFailureHint') }}
          </p>
        </section>

        <section v-if="steps.length" class="space-y-2">
          <h3 class="text-sm font-semibold text-highlighted">
            {{ t('training.exercise.instructions') }}
          </h3>
          <ol class="space-y-2">
            <li v-for="(step, i) in steps" :key="i" class="flex gap-3 text-sm">
              <span class="size-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {{ i + 1 }}
              </span>
              <span class="pt-0.5 text-default">{{ step }}</span>
            </li>
          </ol>
        </section>

        <section class="space-y-2">
          <h3 class="text-sm font-semibold text-highlighted">
            {{ t('training.exercise.muscles') }}
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="muscle in exercise.muscles"
              :key="muscle"
              color="primary"
              variant="soft"
              :label="muscle"
            />
          </div>
        </section>

        <UAlert
          v-if="exercise.equipment && !hasWeight"
          color="neutral"
          variant="subtle"
          icon="i-lucide-weight"
          :title="t('training.exercise.suggestedWeight')"
          :description="t('training.exercise.suggestedWeightHint')"
          :actions="[{ label: t('training.exercise.registerWeight'), to: '/profile', variant: 'link', trailingIcon: 'i-lucide-chevron-right' }]"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          :label="t('common.close')"
          @click="open = false"
        />
        <UButton
          icon="i-lucide-clipboard-pen"
          :label="t('progress.workouts.register')"
          @click="register"
        />
      </div>
    </template>
  </UModal>
</template>
