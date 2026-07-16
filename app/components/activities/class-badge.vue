<script setup lang="ts">
import type { ActivityClass } from "~/interfaces/ActivityResponseDto";

const props = defineProps<{
  activityClass: ActivityClass | null;
  testId?: string;
}>();

const config = computed(() => {
  if (!props.activityClass) return null;
  const configs: Record<ActivityClass, { label: string; classes: string }> = {
    COMPLEMENTAR: {
      label: "Complementar",
      classes: "bg-primary-50 text-primary-700 border-primary-200",
    },
    LIVRE: {
      label: "Livre",
      classes: "bg-neutral-100 text-neutral-600 border-neutral-200",
    },
  };
  return configs[props.activityClass];
});
</script>

<template>
  <span
    v-if="config"
    :data-testid="testId"
    :class="['inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold', config.classes]"
  >
    {{ config.label }}
  </span>
</template>
