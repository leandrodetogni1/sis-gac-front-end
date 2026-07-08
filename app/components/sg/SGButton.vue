<script setup lang="ts">
const props = defineProps<{
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  loading?: boolean;
  testId?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  block?: boolean;
  icon?: string;
  trailingIcon?: string;
}>();

const isDisabled = computed(() => props.disabled || props.loading);

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    xs: "h-7 gap-1 rounded-md px-2.5 text-xs",
    sm: "h-8 gap-1.5 rounded-lg px-3 text-sm",
    md: "h-9 gap-2 rounded-lg px-4 text-sm",
    lg: "h-11 gap-2 rounded-lg px-5 text-base",
    xl: "h-12 gap-2.5 rounded-xl px-6 text-base",
  };
  return map[props.size ?? "md"] ?? map.md;
});

const iconSize = computed(() => {
  const map: Record<string, string> = {
    xs: "0.8rem",
    sm: "0.95rem",
    md: "1rem",
    lg: "1.1rem",
    xl: "1.2rem",
  };
  return map[props.size ?? "md"] ?? map.md;
});

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    primary: [
      "bg-primary-500 text-white",
      "shadow-sm shadow-primary-500/30",
      "enabled:hover:bg-primary-400 enabled:hover:shadow-md enabled:hover:shadow-primary-500/30",
      "enabled:active:bg-primary-600",
      "focus-visible:ring-2 focus-visible:ring-primary-400",
    ].join(" "),
    secondary: [
      "border border-neutral-200 bg-white text-neutral-700 shadow-sm shadow-neutral-900/5",
      "enabled:hover:border-primary-200 enabled:hover:bg-primary-50/60 enabled:hover:text-primary-600",
      "enabled:active:bg-primary-50",
      "focus-visible:ring-2 focus-visible:ring-primary-300",
    ].join(" "),
    danger: [
      "border border-error-200 bg-error-50 text-error-700",
      "enabled:hover:border-error-300 enabled:hover:bg-error-100",
      "enabled:active:bg-error-200/60",
      "focus-visible:ring-2 focus-visible:ring-error-300",
    ].join(" "),
    success: [
      "bg-success-600 text-white",
      "shadow-sm shadow-success-600/30",
      "enabled:hover:bg-success-700 enabled:hover:shadow-md enabled:hover:shadow-success-600/30",
      "enabled:active:bg-success-800",
      "focus-visible:ring-2 focus-visible:ring-success-400",
    ].join(" "),
    ghost: [
      "bg-transparent text-neutral-600",
      "enabled:hover:bg-neutral-100 enabled:hover:text-neutral-900",
      "enabled:active:bg-neutral-200/70",
      "focus-visible:ring-2 focus-visible:ring-neutral-300",
    ].join(" "),
  };
  return map[props.variant ?? "primary"] ?? map.primary;
});
</script>

<template>
  <button
    type="button"
    :disabled="isDisabled"
    :data-testid="testId"
    :class="[
      'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap font-semibold',
      'transition-all duration-200 ease-out',
      'enabled:hover:-translate-y-px enabled:active:translate-y-0 enabled:active:scale-[0.98]',
      'focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
      'motion-reduce:transform-none motion-reduce:transition-none',
      sizeClasses,
      variantClasses,
      block ? 'w-full' : '',
    ]"
  >
    <Icon v-if="loading" name="lucide:loader-circle" :size="iconSize" class="shrink-0 animate-spin" />
    <Icon v-else-if="icon" :name="icon" :size="iconSize" class="shrink-0" />
    <slot />
    <Icon v-if="trailingIcon && !loading" :name="trailingIcon" :size="iconSize" class="shrink-0" />
  </button>
</template>
