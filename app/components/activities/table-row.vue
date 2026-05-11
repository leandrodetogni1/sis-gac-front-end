<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

const props = defineProps<{
  activity: ActivityResponseDto;
}>();

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
  <tr
    class="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50"
    @click="emit('select', activity)"
    :data-testid="`activity-row-${activity.id}`"
  >
    <td class="py-3 pr-4 font-medium text-neutral-900">{{ label }}</td>
    <td class="py-3 pr-4 text-neutral-500">{{ activity.activity_types?.category ?? "—" }}</td>
    <td class="py-3 pr-4 text-neutral-500">{{ activity.hours ?? 0 }}h</td>
    <td class="py-3 pr-4 text-neutral-500">{{ formatDateTimeBR(activity.startDate) }}</td>
    <td class="py-3 pr-4 text-neutral-500">{{ userName }}</td>
    <td class="py-3">
      <SGBadge :status="activity.status || 'pending'" :test-id="`badge-${activity.id}`" />
    </td>
  </tr>
</template>
