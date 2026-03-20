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
    :options="options"
    :data-testid="testId"
    color="primary"
    class="w-full"
    value-key="value"
    label-key="label"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="label" #label>
      {{ label }}
    </template>
  </USelect>
</template>
