<script setup lang="ts">
defineProps<{
  modelValue?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  testId?: string;
  options: { label: string; value: string }[];
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <USelect
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :items="options"
    :data-testid="testId"
    color="primary"
    class="w-full"
    value-key="value"
    label-key="label"
    :ui="{ base: 'min-h-11 text-base sm:min-h-8 sm:text-sm', item: 'min-h-11 text-base sm:min-h-8 sm:text-sm' }"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
