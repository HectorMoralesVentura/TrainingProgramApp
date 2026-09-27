<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  // eslint-disable-next-line vue/require-default-prop
  error: Object as () => NuxtError,
});
</script>

<template>
  <UError
    :error="{
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
      message: error?.message,
    }"
  />
</template>
