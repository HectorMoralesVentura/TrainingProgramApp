<script setup lang="ts">
const props = defineProps<{
  workoutId: number
  /** true = ya completó todos los ejercicios (cambia el texto). */
  allDone: boolean
}>()

const emit = defineEmits<{ finished: [reportId: number], cancelled: [] }>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const finish = useFinishWorkout()
const cancel = useCancelWorkout()

const perceivedEffort = ref<number | null>(null)
const notes = ref('')
const confirmCancel = ref(false)

async function onFinish() {
  try {
    const report = await finish.mutateAsync({ workoutId: props.workoutId, perceived_effort: perceivedEffort.value, notes: notes.value })
    emit('finished', report.id)
    open.value = false
  } catch {
    // El toast de error lo muestra la mutación.
  }
}

async function onCancel() {
  try {
    await cancel.mutateAsync(props.workoutId)
    emit('cancelled')
    open.value = false
  } catch {
    // El toast de error lo muestra la mutación.
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="allDone ? t('session.finish.doneTitle') : t('session.finish.title')"
    :description="allDone ? t('session.finish.doneDescription') : t('session.finish.description')"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField :label="t('progress.workouts.effort')" :help="t('progress.workouts.effortHelp')">
          <UInputNumber v-model="perceivedEffort" :min="1" :max="10" :placeholder="t('common.optional')" class="w-full" />
        </UFormField>
        <UFormField :label="t('progress.workouts.notes')">
          <UTextarea v-model="notes" :rows="2" :maxlength="500" autoresize class="w-full" />
        </UFormField>
        <UAlert
          v-if="confirmCancel"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="t('session.finish.cancelConfirmTitle')"
          :description="t('session.finish.cancelConfirmDescription')"
          :actions="[
            { label: t('session.finish.cancelConfirm'), color: 'error', loading: cancel.isPending.value, onClick: onCancel },
            { label: t('common.cancel'), color: 'neutral', variant: 'outline', onClick: () => (confirmCancel = false) },
          ]"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <UButton v-if="!confirmCancel" color="error" variant="ghost" icon="i-lucide-x" :label="t('session.finish.cancelWorkout')" @click="confirmCancel = true" />
        <div class="flex gap-2 ms-auto">
          <UButton v-if="!allDone" color="neutral" variant="outline" :label="t('session.player.keepGoing')" @click="open = false" />
          <UButton icon="i-lucide-flag" :loading="finish.isPending.value" :label="t('session.finish.submit')" @click="onFinish" />
        </div>
      </div>
    </template>
  </UModal>
</template>
