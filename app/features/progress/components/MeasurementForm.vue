<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { MeasurementForm } from '~/features/progress/schemas/measurement.schema'
import type { MeasurementPayload } from '~/features/progress/types/progress.types'

const { t } = useI18n()
const { today } = useDateFormat()
const form = useTemplateRef('form')
const { mutateAsync, isPending } = useSaveMeasurement()

const schema = computed(() => createMeasurementSchema(t, today()))

type OptionalKey = 'height_cm' | 'body_fat_pct' | 'chest_cm' | 'waist_cm' | 'hip_cm' | 'arm_cm' | 'thigh_cm'

function emptyState() {
  return {
    weight_kg: undefined as number | undefined,
    measured_at: today(),
    height_cm: null as number | null,
    body_fat_pct: null as number | null,
    chest_cm: null as number | null,
    waist_cm: null as number | null,
    hip_cm: null as number | null,
    arm_cm: null as number | null,
    thigh_cm: null as number | null,
    notes: '',
  }
}

const state = reactive(emptyState())
const showMore = ref(false)

const bodyFields: OptionalKey[] = ['chest_cm', 'waist_cm', 'hip_cm', 'arm_cm', 'thigh_cm']

function unitFormat(unit: 'kilogram' | 'centimeter') {
  return { style: 'unit' as const, unit, unitDisplay: 'short' as const, maximumFractionDigits: 2 }
}

function toPayload(data: MeasurementForm): MeasurementPayload {
  const payload: MeasurementPayload = { weight_kg: data.weight_kg, measured_at: data.measured_at }
  const optional: OptionalKey[] = ['height_cm', 'body_fat_pct', 'chest_cm', 'waist_cm', 'hip_cm', 'arm_cm', 'thigh_cm']
  for (const key of optional) {
    if (data[key] != null) payload[key] = data[key]
  }
  if (data.notes) payload.notes = data.notes
  return payload
}

async function onSubmit(event: FormSubmitEvent<MeasurementForm>) {
  try {
    await mutateAsync(toPayload(event.data))
    Object.assign(state, emptyState())
    form.value?.clear()
  } catch (error) {
    form.value?.setErrors(apiFieldErrors(error))
  }
}
</script>

<template>
  <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField name="weight_kg" :label="t('progress.measurements.weight')" required>
        <UInputNumber
          v-model="state.weight_kg"
          :min="20"
          :max="400"
          :step="0.1"
          :format-options="unitFormat('kilogram')"
          class="w-full"
        />
      </UFormField>
      <UFormField name="measured_at" :label="t('progress.measurements.date')" :help="t('progress.measurements.dateHelp')">
        <UInput v-model="state.measured_at" type="date" :max="today()" class="w-full" />
      </UFormField>
      <UFormField name="height_cm" :label="t('progress.measurements.height')">
        <UInputNumber
          v-model="state.height_cm"
          :min="50"
          :max="260"
          :placeholder="t('common.optional')"
          :format-options="unitFormat('centimeter')"
          class="w-full"
        />
      </UFormField>
      <UFormField name="body_fat_pct" :label="t('progress.measurements.bodyFat')">
        <UInputNumber
          v-model="state.body_fat_pct"
          :min="1"
          :max="75"
          :step="0.1"
          :placeholder="t('common.optional')"
          class="w-full"
        />
      </UFormField>
    </div>

    <UCollapsible v-model:open="showMore">
      <UButton
        color="neutral"
        variant="link"
        class="px-0"
        :trailing-icon="showMore ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        :label="t('progress.measurements.bodyMeasures')"
      />
      <template #content>
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 pt-3">
          <UFormField
            v-for="field in bodyFields"
            :key="field"
            :name="field"
            :label="t(`progress.measurements.fields.${field}`)"
          >
            <UInputNumber
              v-model="state[field]"
              :min="1"
              :step="0.5"
              :placeholder="t('common.optional')"
              :format-options="unitFormat('centimeter')"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
    </UCollapsible>

    <UFormField name="notes" :label="t('progress.measurements.notes')">
      <UTextarea v-model="state.notes" :rows="2" :maxlength="500" autoresize class="w-full" />
    </UFormField>

    <div class="flex justify-end">
      <UButton type="submit" icon="i-lucide-check" :loading="isPending" :label="t('common.save')" />
    </div>
  </UForm>
</template>
