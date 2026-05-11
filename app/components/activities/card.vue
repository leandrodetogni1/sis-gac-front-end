<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

const props = withDefaults(
  defineProps<{
    activity: ActivityResponseDto;
    showUser?: boolean;
  }>(),
  { showUser: true },
);

const emit = defineEmits(["select"]);

const label = computed(() => {
  return props.activity.activity_types?.label ?? props.activity.event ?? "—";
});

const userName = computed(() => {
  if (!props.activity.users) return "—";
  return `${props.activity.users.firstName} ${props.activity.users.lastName}`;
});
</script>

<template>
  <div class="cursor-pointer rounded-lg border border-default p-3 transition-colors hover:bg-elevated" :data-testid="`activity-card-${activity.id}`" @click="emit('select', activity)">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="font-medium text-highlighted">{{ label }}</p>
        <p class="mt-0.5 text-xs text-muted">
          {{ activity.activity_types?.category ?? "—" }}<template v-if="showUser"> · {{ userName }}</template>
        </p>
      </div>
      <SGBadge :status="activity.status || 'pending'" />
    </div>
    <div class="mt-2 flex items-center justify-between text-xs text-muted">
      <span class="font-medium text-toned">{{ activity.hoursEquivalent ?? activity.hours ?? 0 }}h</span>
      <span>{{ formatDateTimeBR(activity.startDate) }}</span>
    </div>
  </div>
</template>
