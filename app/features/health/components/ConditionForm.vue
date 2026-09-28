<script setup lang="ts">
import type { FormSubmitEvent, SelectMenuItem } from '@nuxt/ui'
import type { UserConditionForm } from '~/features/health/schemas/user-condition.schema'

const emit = defineEmits<{ saved: [] }>()

const { t } = useI18n()
const { today } = useDateFormat()
const form = useTemplateRef('form')

const { data: conditions, isPending: conditionsPending } = useConditions()
const { data: myConditions } = useMyConditions()
const { options: zoneOptions, isPending: zonesPending } = useZoneOptions()
const { mutateAsync, isPending } = useAddMyCondition()

const schema = computed(() => createUserConditionSchema(t, today()))

function emptyState(): UserConditionForm {
  return { condition: '', severity: 'moderate', started_at: '', notes: '', affected_zones: [] }
}
const state = reactive(emptyState())

// Agrupadas por categoría; las que el usuario ya registró aparecen deshabilitadas (el backend respondería 400).
const conditionItems = computed<SelectMenuItem[][]>(() => {
  const registered = new Set(myConditions.value?.map(c => c.condition.slug))
  return CONDITION_CATEGORIES.map(category => [
    { type: 'label' as const, label: t(`health.categories.${category.value}`) },
    ...(conditions.value ?? [])
      .filter(c => c.category === category.value)
      .map(c => ({
        label: c.name,
        value: c.slug,
        icon: category.icon,
        disabled: registered.has(c.slug),
      })),
  ]).filter(group => group.length > 1)
})

const severityItems = computed(() =>
  CONDITION_SEVERITIES.map(s => ({ label: t(`health.severities.${s.value}`), value: s.value })),
)

async function onSubmit(event: FormSubmitEvent<UserConditionForm>) {
  try {
    await mutateAsync({
      condition: event.data.condition,
      severity: event.data.severity,
      notes: event.data.notes || undefined,
      started_at: event.data.started_at || null,
      affected_zones: event.data.affected_zones,
    })
    Object.assign(state, emptyState())
    form.value?.clear()
    emit('saved')
  } catch (error) {
    form.value?.setErrors(apiFieldErrors(error))
  }
}
</script>

<template>
  <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="condition" :label="t('health.form.condition')" required>
      <USelectMenu
        v-model="state.condition"
        :items="conditionItems"
        value-key="value"
        :loading="conditionsPending"
        :placeholder="t('health.form.conditionPlaceholder')"
        :search-input="{ placeholder: t('common.search') }"
        class="w-full"
      />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField name="severity" :label="t('health.form.severity')" :help="t('health.form.severityHelp')">
        <USelect v-model="state.severity" :items="severityItems" class="w-full" />
      </UFormField>
      <UFormField name="started_at" :label="t('health.form.startedAt')">
        <UInput v-model="state.started_at" type="date" :max="today()" class="w-full" />
      </UFormField>
    </div>

    <UFormField name="affected_zones" :label="t('health.form.affectedZones')" :help="t('health.form.affectedZonesHelp')">
      <USelectMenu
        v-model="state.affected_zones"
        :items="zoneOptions"
        value-key="value"
        multiple
        :loading="zonesPending"
        :placeholder="t('common.optional')"
        :search-input="{ placeholder: t('common.search') }"
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" :label="t('health.form.notes')">
      <UTextarea v-model="state.notes" :rows="2" :maxlength="500" autoresize class="w-full" />
    </UFormField>

    <div class="flex justify-end">
      <UButton type="submit" icon="i-lucide-plus" :loading="isPending" :label="t('health.form.submit')" />
    </div>
  </UForm>
</template>
