<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  testId?: string;
  icon?: string;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <UInput
    :model-value="modelValue"
    :placeholder="placeholder"
    :type="type ?? 'text'"
    :disabled="disabled"
    :leading-icon="icon"
    :data-testid="testId"
    color="primary"
    class="w-full"
    :ui="{ base: 'min-h-11 text-base sm:min-h-8 sm:text-sm' }"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
