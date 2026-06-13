<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    achieved: number;
    target: number | null;
    meetsMinimum: boolean;
  }>(),
  { target: null },
);

const percentage = computed(() => {
  if (!props.target || props.target <= 0) return 0;
  const pct = (props.achieved / props.target) * 100;
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
});

const barColor = computed(() => {
  if (props.meetsMinimum) return "bg-success-500";
  if (percentage.value < 50) return "bg-error-500";
  return "bg-warning-500";
});
</script>

<template>
  <div class="h-2 w-full overflow-hidden rounded-full bg-accented">
    <div class="h-full transition-all duration-300" :class="barColor" :style="{ width: percentage + '%' }" />
  </div>
</template>
