<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  label: string
  src?: string | null
  alt?: string
}>(), {
  src: null,
  alt: '',
})
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden bg-elevated">
    <!-- img nativo: Nuxt UI no tiene componente de imagen y @nuxt/image no está instalado -->
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="size-full object-cover"
      loading="lazy"
    >
    <div
      v-else
      class="size-full flex flex-col items-center justify-center gap-2 text-dimmed bg-[radial-gradient(circle_at_center,var(--ui-bg-accented)_1px,transparent_1px)] bg-size-[14px_14px]"
    >
      <UIcon :name="icon" class="size-8" />
      <span class="text-xs">{{ label }}</span>
    </div>
    <slot />
  </div>
</template>
