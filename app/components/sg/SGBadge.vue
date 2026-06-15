<script setup lang="ts">
const props = defineProps<{
  status: string;
  testId?: string;
}>();

const badgeConfig = computed(() => {
  const normalizedStatus = props.status?.toLowerCase();
  const configs: Record<string, { label: string; bg: string; text: string; border: string }> = {
    approved: {
      label: "Aprovado",
      bg: "bg-[#16A34A]/12",
      text: "text-[#15803D]",
      border: "border-[#16A34A]/30",
    },
    pending: {
      label: "Pendente",
      bg: "bg-[#F59E0B]/15",
      text: "text-[#B45309]",
      border: "border-[#F59E0B]/35",
    },
    verified: {
      label: "Verificado",
      bg: "bg-[#2563EB]/12",
      text: "text-[#1D4ED8]",
      border: "border-[#2563EB]/30",
    },
    rejected: {
      label: "Rejeitado",
      bg: "bg-[#DC2626]/12",
      text: "text-[#B91C1C]",
      border: "border-[#DC2626]/30",
    },
  };
  return configs[normalizedStatus] ?? configs.pending;
});
</script>

<template>
  <span
    v-if="badgeConfig"
    :data-testid="testId"
    :class="['inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold', badgeConfig.bg, badgeConfig.text, badgeConfig.border]"
  >
    {{ badgeConfig.label }}
  </span>
</template>
