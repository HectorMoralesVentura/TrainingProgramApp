<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const { username, photoUrl } = useAuth()
const upload = useUploadProfilePhoto()
const remove = useDeleteProfilePhoto()

const file = ref<File | null>(null)

// Se sube en cuanto el usuario elige la imagen.
watch(file, async (selected) => {
  if (!selected) return
  const errorKey = imageFileErrorKey(selected)
  if (errorKey) {
    toast.add({ title: t('profile.photo.uploadErrorTitle'), description: t(errorKey, { mb: MAX_IMAGE_MB }), color: 'error' })
  } else {
    await upload.mutateAsync(selected).catch(() => undefined)
  }
  file.value = null
})

const busy = computed(() => upload.isPending.value || remove.isPending.value)
</script>

<template>
  <UFileUpload v-model="file" :accept="IMAGE_ACCEPT" :preview="false" :dropzone="false" :interactive="false">
    <template #default="{ open }">
      <div class="relative shrink-0">
        <UAvatar :src="photoUrl ?? undefined" :alt="username ?? ''" size="3xl" class="size-16 sm:size-20 text-2xl" />
        <UDropdownMenu
          :items="[
            [{ label: t('profile.photo.change'), icon: 'i-lucide-image-up', onSelect: () => open() }],
            ...(photoUrl ? [[{ label: t('profile.photo.remove'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => remove.mutate() }]] : []),
          ]"
          :content="{ align: 'start' }"
        >
          <UButton
            class="absolute -bottom-1 -right-1 rounded-full"
            size="xs"
            icon="i-lucide-camera"
            :loading="busy"
            :aria-label="t('profile.photo.change')"
          />
        </UDropdownMenu>
      </div>
    </template>
  </UFileUpload>
</template>
