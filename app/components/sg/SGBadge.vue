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
      bg: "bg-[#BCCF00]/10",
      text: "text-[#BCCF00]",
      border: "border-[#BCCF00]/30",
    },
    pending: {
      label: "Pendente",
      bg: "bg-[#F9D500]/10",
      text: "text-[#F9D500]",
      border: "border-[#F9D500]/30",
    },
    rejected: {
      label: "Rejeitado",
      bg: "bg-[#C00D0D]/10",
      text: "text-[#C00D0D]",
      border: "border-[#C00D0D]/30",
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
