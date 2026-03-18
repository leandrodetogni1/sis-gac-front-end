<script setup lang="ts">
defineProps<{
  testId?: string;
}>();
</script>

<template>
  <div
    :data-testid="testId"
    class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6"
  >
    <slot />
  </div>
</template>
