<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    approved: number;
    pending?: number;
    target: number | null;
  }>(),
  { pending: 0, target: null },
);

const approvedPct = computed(() => {
  if (!props.target || props.target <= 0) return 0;
  return Math.min(100, Math.max(0, (props.approved / props.target) * 100));
});

const pendingPct = computed(() => {
  if (!props.target || props.target <= 0) return 0;
  const raw = Math.max(0, (props.pending / props.target) * 100);
  return Math.min(raw, 100 - approvedPct.value);
});
</script>

<template>
  <div>
    <div class="flex h-2 w-full overflow-hidden rounded-full bg-accented">
      <div class="h-full bg-success-500 transition-all duration-300" :style="{ width: approvedPct + '%' }" />
      <div class="h-full bg-warning-500 transition-all duration-300" :style="{ width: pendingPct + '%' }" />
    </div>
    <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-2 shrink-0 rounded-full bg-success-500" />
        <span>Aprovadas: {{ formatHours(approved) }}</span>
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-2 shrink-0 rounded-full bg-warning-500" />
        <span>Pendentes: {{ formatHours(pending) }}</span>
      </span>
    </div>
  </div>
</template>
