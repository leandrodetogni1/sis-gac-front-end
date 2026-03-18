<script setup lang="ts">
const props = defineProps<{
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  testId?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  block?: boolean;
  icon?: string;
}>();

const colorMap = computed(() => {
  const map: Record<string, string> = {
    primary: "primary",
    secondary: "secondary",
    danger: "error",
  };
  return map[props.variant ?? "primary"] ?? "primary";
});

const variantMap = computed(() => {
  return props.variant === "secondary" ? "soft" : "solid";
});
</script>

<template>
  <UButton
    :color="colorMap"
    :variant="variantMap"
    :loading="loading"
    :disabled="disabled"
    :size="size ?? 'md'"
    :block="block"
    :icon="icon"
    :data-testid="testId"
    class="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:opacity-90"
  >
    <slot />
  </UButton>
</template>
