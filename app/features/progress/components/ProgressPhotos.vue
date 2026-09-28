<script setup lang="ts">
import type { ProgressPhoto } from '~/features/progress/types/progress.types'
import { API_PAGE_SIZE } from '~/shared/types/api.types'

const { t } = useI18n()
const { formatDate, today } = useDateFormat()

const page = ref(1)
const { data, isPending, isError, errorMessage, isPlaceholderData } = useProgressPhotos(page)
const upload = useUploadProgressPhoto()
const remove = useDeleteProgressPhoto()

// Formulario de subida
const file = ref<File | null>(null)
const takenAt = ref(today())
const note = ref('')
const fileError = computed(() => {
  const key = file.value ? imageFileErrorKey(file.value) : null
  return key ? t(key, { mb: MAX_IMAGE_MB }) : ''
})

async function submit() {
  if (!file.value || fileError.value) return
  try {
    await upload.mutateAsync({ file: file.value, taken_at: takenAt.value, note: note.value })
    file.value = null
    note.value = ''
    takenAt.value = today()
    page.value = 1
  } catch {
    // El toast de error lo muestra la mutación.
  }
}

// Vista ampliada y confirmación de borrado
const viewing = ref<ProgressPhoto | null>(null)
const viewerOpen = computed({
  get: () => viewing.value != null,
  set: (value) => {
    if (!value) viewing.value = null
  },
})

async function deleteViewing() {
  if (!viewing.value) return
  await remove.mutateAsync(viewing.value.id).catch(() => undefined)
  viewing.value = null
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
    <UCard>
      <template #header>
        <h2 class="font-semibold text-highlighted">
          {{ t('progress.photos.formTitle') }}
        </h2>
        <p class="text-sm text-muted">
          {{ t('progress.photos.formDescription') }}
        </p>
      </template>

      <form class="space-y-4" @submit.prevent="submit">
        <UFormField :error="fileError || undefined">
          <UFileUpload
            v-model="file"
            :accept="IMAGE_ACCEPT"
            icon="i-lucide-image-up"
            :label="t('progress.photos.dropLabel')"
            :description="t('progress.photos.dropDescription', { mb: MAX_IMAGE_MB })"
            layout="list"
            class="w-full min-h-40"
          />
        </UFormField>
        <UFormField :label="t('progress.photos.takenAt')">
          <UInput v-model="takenAt" type="date" :max="today()" class="w-full" />
        </UFormField>
        <UFormField :label="t('progress.photos.note')">
          <UTextarea v-model="note" :rows="2" :maxlength="300" autoresize class="w-full" />
        </UFormField>
        <div class="flex justify-end">
          <UButton
            type="submit"
            icon="i-lucide-upload"
            :disabled="!file || !!fileError"
            :loading="upload.isPending.value"
            :label="t('progress.photos.upload')"
          />
        </div>
      </form>
    </UCard>

    <section class="space-y-3 min-w-0">
      <h2 class="font-semibold text-highlighted">
        {{ t('progress.photos.galleryTitle') }}
      </h2>

      <UAlert
        v-if="isError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="t('progress.photos.loadError')"
        :description="errorMessage"
      />

      <div v-else-if="isPending" class="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <USkeleton v-for="n in 6" :key="n" class="aspect-[3/4] rounded-xl" />
      </div>

      <UEmpty
        v-else-if="!data?.count"
        icon="i-lucide-images"
        :title="t('progress.photos.empty')"
        :description="t('progress.photos.emptyDescription')"
      />

      <template v-else>
        <div class="grid gap-3 grid-cols-2 sm:grid-cols-3 transition-opacity" :class="isPlaceholderData && 'opacity-60'">
          <button
            v-for="photo in data.results"
            :key="photo.id"
            type="button"
            class="group relative aspect-[3/4] overflow-hidden rounded-xl bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
            :aria-label="t('progress.photos.open', { date: formatDate(photo.taken_at) })"
            @click="viewing = photo"
          >
            <!-- img nativo: Nuxt UI no tiene componente de imagen -->
            <img :src="photo.url" :alt="photo.note || formatDate(photo.taken_at)" loading="lazy" class="size-full object-cover transition-transform duration-300 group-hover:scale-105">
            <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs font-medium text-white">
              {{ formatDate(photo.taken_at) }}
            </span>
          </button>
        </div>
        <div v-if="data.count > API_PAGE_SIZE" class="flex justify-center">
          <UPagination v-model:page="page" :total="data.count" :items-per-page="API_PAGE_SIZE" />
        </div>
      </template>
    </section>

    <UModal
      v-model:open="viewerOpen"
      :title="viewing ? formatDate(viewing.taken_at, { dateStyle: 'long' }) : ''"
      :description="viewing?.note || undefined"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body>
        <img v-if="viewing" :src="viewing.url" :alt="viewing.note || ''" class="w-full max-h-[70vh] object-contain rounded-lg">
      </template>
      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" :loading="remove.isPending.value" :label="t('common.delete')" @click="deleteViewing" />
          <UButton color="neutral" variant="outline" :label="t('common.close')" @click="viewerOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
