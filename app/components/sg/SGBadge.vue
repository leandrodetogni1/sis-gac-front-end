<script setup lang="ts">
const props = defineProps<{
  status: "approved" | "pending" | "rejected";
  testId?: string;
}>();

const badgeConfig = computed(() => {
  const configs: Record<string, { label: string; color: string }> = {
    approved: { label: "Aprovado", color: "success" },
    pending: { label: "Pendente", color: "warning" },
    rejected: { label: "Rejeitado", color: "error" },
  };
  return configs[props.status];
});
</script>

<template>
  <UBadge
    :color="badgeConfig.color as any"
    variant="subtle"
    :data-testid="testId"
    class="rounded-full px-3 py-1 text-xs font-bold"
  >
    {{ badgeConfig.label }}
  </UBadge>
</template>
