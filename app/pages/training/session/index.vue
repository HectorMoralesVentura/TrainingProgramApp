<script setup lang="ts">
import type { TimerPhase } from '~/features/workout-session/composables/useWorkoutTimer'
import SessionTimerRing from '~/features/workout-session/components/SessionTimerRing.vue'
import WorkoutExercisesSlideover from '~/features/workout-session/components/WorkoutExercisesSlideover.vue'
import FinishWorkoutModal from '~/features/workout-session/components/FinishWorkoutModal.vue'
import AddExercisesModal from '~/features/workout-session/components/AddExercisesModal.vue'
import MuscleMap from '~/features/training/components/MuscleMap.vue'

definePageMeta({ middleware: 'auth', layout: false })

const { t } = useI18n()
const { data: workout, isPending } = useCurrentWorkout()
const { timer, isPaused, attach, enter, elapsed: phaseElapsed, pause, resume, addTime, reset } = useWorkoutTimer()
const { muted } = usePhaseAlert()
const logSet = useLogSet()
const addExercise = useAddWorkoutExercise()

// Sin entrenamiento en curso se vuelve a Entrenar, salvo cuando este mismo se está terminando o
// cancelando: la mutación limpia la caché antes de que el modal navegue al reporte.
const leaving = ref(false)
const finishOpen = ref(false)
watch([isPending, workout], ([pending, current]) => {
  if (!pending && !current && !leaving.value && !finishOpen.value) navigateTo('/training')
  if (current) attach(current.id)
}, { immediate: true })

const { data: zonesCatalog } = useDisciplineZones(() => workout.value?.discipline ?? '')
const zoneNames = computed<Record<string, string>>(() => {
  const names: Record<string, string> = {}
  for (const z of zonesCatalog.value ?? []) names[z.slug] = z.name
  for (const z of workout.value?.zones ?? []) names[z.slug] = z.name
  return names
})

// Ejercicio actual: el elegido (si no está completo) o el primero pendiente que no se haya saltado.
const current = computed(() => {
  const w = workout.value
  if (!w) return null
  const chosen = w.exercises.find(e => e.id === timer.value.logId && !e.completed)
  if (chosen) return chosen
  return w.exercises.find(e => !e.completed && !timer.value.skipped.includes(e.id!))
    ?? w.exercises.find(e => !e.completed)
    ?? null
})
watch(() => current.value?.id, (id) => {
  timer.value.logId = id ?? null
})

const allDone = computed(() => !!workout.value?.exercises.length && workout.value.exercises.every(e => e.completed))
const setNumber = computed(() => (current.value ? current.value.sets_done.length + 1 : 0))
const hold = computed(() => !!current.value && isHoldExercise(current.value))
const phase = computed(() => timer.value.phase)
const layout = computed(() => (current.value ? exerciseMuscleLayout(muscleIdsFromNames(current.value.exercise.muscles)) : null))

const setsTotal = computed(() => workout.value?.exercises.reduce((s, e) => s + e.sets, 0) ?? 0)
const setsDone = computed(() => workout.value?.exercises.reduce((s, e) => s + e.sets_done.length, 0) ?? 0)

const target = computed(() => {
  const c = current.value
  if (!c) return ''
  if (c.to_failure) return t('training.exercise.toFailureShort')
  if (hold.value) return formatClock(c.duration_seconds ?? 0)
  return t('session.player.repsTargetTime', { n: c.reps, time: formatClock(c.work_seconds_per_set) })
})

// ---------- Fases ----------

function startWork() {
  if (current.value) enter('work', workSecondsFor(current.value))
}

function toLog(workSeconds: number) {
  timer.value.lastWorkSeconds = Math.round(workSeconds)
  enter('log', 0)
}

function endRest(restSeconds: number) {
  timer.value.pendingRestSeconds = Math.round(restSeconds)
  startWork()
}

function onExpire(expired: TimerPhase) {
  if (expired === 'prepare') startWork()
  else if (expired === 'work') toLog(timer.value.phaseSeconds)
  else if (expired === 'rest') endRest(timer.value.phaseSeconds)
}

const { now, remaining, progress } = useSessionClock(onExpire)

const sessionElapsed = computed(() => (workout.value ? (now.value.getTime() - Date.parse(workout.value.started_at)) / 1000 : 0))

function primaryAction() {
  if (isPaused.value) resume()
  if (phase.value === 'prepare') startWork()
  else if (phase.value === 'work') toLog(phaseElapsed())
  else if (phase.value === 'rest') endRest(phaseElapsed())
}

// ---------- Captura de la serie ----------

const form = reactive<{ reps: number | null, weight: number | null, duration: number | null }>({ reps: null, weight: null, duration: null })
watch([phase, () => current.value?.id], ([p]) => {
  if (p !== 'log' || !current.value) return
  form.reps = current.value.to_failure || hold.value ? null : current.value.reps
  form.weight = current.value.suggested_weight_kg
  form.duration = hold.value ? timer.value.lastWorkSeconds || current.value.duration_seconds : null
}, { immediate: true })

const formValid = computed(() => (hold.value ? (form.duration ?? 0) > 0 : (form.reps ?? 0) > 0))

async function saveSet() {
  const w = workout.value
  const c = current.value
  if (!w || !c?.id || !formValid.value) return
  const restAfter = c.rest_seconds
  try {
    const updated = await logSet.mutateAsync({
      workoutId: w.id,
      logId: c.id,
      body: {
        reps: hold.value ? null : form.reps,
        weight_kg: form.weight,
        duration_seconds: hold.value ? form.duration : null,
        rest_seconds: timer.value.pendingRestSeconds,
      },
    })
    timer.value.pendingRestSeconds = null
    if (updated.exercises.every(e => e.completed)) {
      finishOpen.value = true
      return
    }
    enter('rest', restAfter)
  } catch {
    // El toast de error lo muestra la mutación; la captura sigue abierta para reintentar.
  }
}

// ---------- Navegación entre ejercicios ----------

function skipExercise() {
  const c = current.value
  if (!c?.id) return
  if (!timer.value.skipped.includes(c.id)) timer.value.skipped.push(c.id)
  timer.value.logId = null
  nextTick(startWork)
}

function selectExercise(logId: number) {
  timer.value.skipped = timer.value.skipped.filter(id => id !== logId)
  timer.value.logId = logId
  nextTick(startWork)
}

// Id del entrenamiento para el modal de terminar; se conserva aunque la caché quede vacía al terminar.
const modalWorkoutId = ref<number | null>(null)
watch(() => workout.value?.id, (id) => {
  if (id) modalWorkoutId.value = id
}, { immediate: true })

const listOpen = ref(false)
const addOpen = ref(false)

const level = useDisciplineLevel(() => workout.value?.discipline ?? '')
const inPlan = computed(() => workout.value?.exercises.map(e => e.exercise.slug) ?? [])

function onAdd(exercise: { slug: string }) {
  if (workout.value) addExercise.mutate({ workoutId: workout.value.id, exercise: exercise.slug, level: level.value })
}

function onFinished(reportId: number) {
  leaving.value = true
  reset()
  navigateTo(`/workouts/${reportId}`)
}

function onCancelled() {
  leaving.value = true
  reset()
  navigateTo('/training')
}

// Pantalla encendida mientras se entrena (si el navegador lo soporta).
const wakeLock = reactive(useWakeLock())
onMounted(() => wakeLock.isSupported && wakeLock.request('screen'))
onBeforeUnmount(() => wakeLock.isActive && wakeLock.release())

useSeoMeta({ title: () => current.value?.exercise.name ?? t('session.player.title') })
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-default text-default">
    <div v-if="isPending" class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
    </div>

    <template v-else-if="workout">
      <!-- Barra superior: progreso de series y tiempo desde el inicio -->
      <header class="sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur">
        <div class="mx-auto max-w-3xl px-4 py-3 flex items-center gap-2 sm:gap-3">
          <UButton color="neutral" variant="ghost" icon="i-lucide-flag" :aria-label="t('session.player.end')" @click="finishOpen = true" />
          <div class="flex-1 min-w-0">
            <div class="flex justify-between text-xs text-muted mb-1">
              <span>{{ t('session.player.setsProgress', { done: setsDone, total: setsTotal }) }}</span>
              <span class="tabular-nums">{{ formatClock(sessionElapsed) }}</span>
            </div>
            <UProgress :model-value="setsTotal ? (setsDone / setsTotal) * 100 : 0" size="sm" />
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-list" :aria-label="t('session.list.title')" @click="listOpen = true" />
          <UButton
            color="neutral"
            variant="ghost"
            :icon="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            :aria-label="muted ? t('session.player.unmute') : t('session.player.mute')"
            @click="muted = !muted"
          />
        </div>
      </header>

      <!-- Todo completado -->
      <main v-if="allDone || !current" class="flex-1 mx-auto w-full max-w-3xl px-4 py-10 flex flex-col items-center justify-center gap-4 text-center">
        <div class="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <UIcon name="i-lucide-trophy" class="size-8" />
        </div>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ t('session.finish.doneTitle') }}
        </h1>
        <p class="text-muted">
          {{ t('session.finish.doneDescription') }}
        </p>
        <UButton size="xl" icon="i-lucide-flag" :label="t('session.finish.submit')" @click="finishOpen = true" />
      </main>

      <main v-else class="flex-1 mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-6">
        <div class="text-center space-y-1">
          <p class="text-sm text-muted">
            {{ zoneNames[current.zone] ?? current.zone }} · {{ t(`training.levels.${current.level}`) }}
          </p>
          <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
            {{ current.exercise.name }}
          </h1>
          <div class="flex flex-wrap justify-center gap-2 pt-1">
            <UBadge color="neutral" variant="subtle" icon="i-lucide-layers" :label="t('session.player.setOf', { current: setNumber, total: current.sets })" />
            <UBadge color="primary" variant="subtle" :icon="hold ? 'i-lucide-timer' : 'i-lucide-repeat'" :label="target" />
            <UBadge color="neutral" variant="subtle" icon="i-lucide-hourglass" :label="t('session.plan.restBadge', { time: formatClock(current.rest_seconds) })" />
            <UBadge v-if="current.suggested_weight_kg != null" color="neutral" variant="subtle" icon="i-lucide-weight" :label="formatWeight(current.suggested_weight_kg)" />
          </div>
        </div>

        <!-- Captura de la serie -->
        <UCard v-if="phase === 'log'" :ui="{ body: 'p-4 sm:p-6 space-y-4' }">
          <div class="text-center">
            <p class="text-sm font-semibold uppercase tracking-widest text-primary">
              {{ t('session.phase.log') }}
            </p>
            <p class="text-lg font-semibold text-highlighted">
              {{ t('session.player.logTitle', { n: setNumber }) }}
            </p>
          </div>
          <div class="grid gap-3" :class="current.suggested_weight_kg != null || current.exercise.equipment ? 'grid-cols-2' : 'grid-cols-1'">
            <UFormField v-if="hold" :label="t('session.player.secondsDone')">
              <UInputNumber v-model="form.duration" :min="1" size="xl" class="w-full" />
            </UFormField>
            <UFormField v-else :label="t('session.player.repsDone')">
              <UInputNumber v-model="form.reps" :min="1" :max="200" size="xl" class="w-full" />
            </UFormField>
            <UFormField v-if="current.suggested_weight_kg != null || current.exercise.equipment" :label="t('training.exercise.weight')">
              <UInputNumber
                v-model="form.weight"
                :min="0"
                :step="2.5"
                size="xl"
                :format-options="{ style: 'unit', unit: 'kilogram', unitDisplay: 'short', maximumFractionDigits: 2 }"
                class="w-full"
              />
            </UFormField>
          </div>
          <p v-if="timer.pendingRestSeconds != null" class="text-xs text-muted text-center">
            {{ t('session.player.restTaken', { time: formatClock(timer.pendingRestSeconds) }) }}
          </p>
          <UButton block size="xl" icon="i-lucide-check" :disabled="!formValid" :loading="logSet.isPending.value" :label="t('session.player.saveSet')" @click="saveSet" />
        </UCard>

        <div v-else class="grid gap-6 sm:grid-cols-[1fr_12rem] items-center">
          <SessionTimerRing :remaining="remaining" :progress="progress" :phase="phase" :paused="isPaused" />
          <div class="hidden sm:flex h-56 items-center justify-center rounded-xl bg-elevated p-3">
            <img v-if="current.exercise.media.illustration_url" :src="current.exercise.media.illustration_url" :alt="current.exercise.name" class="h-full w-auto object-contain">
            <MuscleMap v-else-if="layout" :highlighted="layout.muscles" :view="layout.view" :region="layout.region" class="h-full w-auto max-w-full" />
          </div>
        </div>

        <UAlert
          v-if="current.restriction_note && phase !== 'rest'"
          color="warning"
          variant="subtle"
          icon="i-lucide-shield-alert"
          :description="current.restriction_note"
        />
      </main>

      <!-- Controles (no se muestran durante la captura ni al terminar) -->
      <footer v-if="current && !allDone && phase !== 'log'" class="sticky bottom-0 border-t border-default bg-default/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div class="mx-auto max-w-3xl px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <UButton
            color="neutral"
            variant="outline"
            size="xl"
            icon="i-lucide-plus"
            :label="`${EXTRA_SECONDS} s`"
            :aria-label="t('session.player.addTime', { n: EXTRA_SECONDS })"
            @click="addTime(EXTRA_SECONDS)"
          />
          <UButton
            size="xl"
            block
            :color="phase === 'work' ? 'primary' : 'neutral'"
            :variant="phase === 'work' ? 'solid' : 'soft'"
            :icon="phase === 'work' ? 'i-lucide-check' : 'i-lucide-skip-forward'"
            :label="phase === 'work' ? t('session.player.setDone') : phase === 'rest' ? t('session.player.skipRest') : t('session.player.startNow')"
            @click="primaryAction"
          />
          <UButton
            color="neutral"
            variant="outline"
            size="xl"
            :icon="isPaused ? 'i-lucide-play' : 'i-lucide-pause'"
            :aria-label="isPaused ? t('session.player.resume') : t('session.player.pause')"
            @click="isPaused ? resume() : pause()"
          />
        </div>
        <div class="mx-auto max-w-3xl px-4 pb-3 flex justify-center">
          <UButton color="neutral" variant="link" size="sm" icon="i-lucide-fast-forward" :label="t('session.player.skipExercise')" @click="skipExercise" />
        </div>
      </footer>

      <WorkoutExercisesSlideover
        v-model:open="listOpen"
        :workout="workout"
        :current-log-id="current?.id ?? null"
        :zone-names="zoneNames"
        @select="selectExercise"
        @add="listOpen = false; addOpen = true"
      />
      <AddExercisesModal
        v-model:open="addOpen"
        :discipline-slug="workout.discipline"
        :in-plan="inPlan"
        @add="onAdd"
      />
    </template>

    <!-- Fuera del bloque del entrenamiento: al terminar, la caché queda vacía y ese bloque se desmonta;
         si el modal viviera adentro se perdería el aviso para ir al reporte. -->
    <FinishWorkoutModal
      v-if="modalWorkoutId"
      v-model:open="finishOpen"
      :workout-id="modalWorkoutId"
      :all-done="allDone"
      @finished="onFinished"
      @cancelled="onCancelled"
    />
  </div>
</template>
