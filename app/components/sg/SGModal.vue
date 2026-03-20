<script setup lang="ts">
const props = defineProps<{
  title?: string;
  description?: string;
  testId?: string;
}>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <UModal v-model:open="open" :title="props.title" :description="props.description" :data-testid="testId">
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <template #body>
      <slot name="body">
        <slot />
      </slot>
    </template>

    <template v-if="$slots.footer" #footer="{ close }">
      <slot name="footer" :close="close" />
    </template>
  </UModal>
</template>
