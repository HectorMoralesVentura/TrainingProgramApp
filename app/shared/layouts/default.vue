<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 min-h-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
