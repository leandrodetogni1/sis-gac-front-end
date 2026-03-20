<script setup lang="ts">
defineProps<{
  modelValue?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  testId?: string;
  rows?: number;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <UTextarea
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows ?? 3"
    :data-testid="testId"
    color="primary"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="label" #label>
      {{ label }}
    </template>
  </UTextarea>
</template>
