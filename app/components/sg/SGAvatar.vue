<script setup lang="ts">
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const props = withDefaults(
  defineProps<{
    firstName?: string | null;
    lastName?: string | null;
    picture?: string | null;
    size?: Size;
    testId?: string;
    alt?: string;
  }>(),
  {
    size: "sm",
  },
);

const loaded = ref(false);
const failed = ref(false);
const imgEl = ref<HTMLImageElement | null>(null);

const syncFromElement = () => {
  const el = imgEl.value;
  if (!el) return;
  if (el.complete && el.naturalHeight > 0) {
    loaded.value = true;
  } else if (el.complete && el.naturalHeight === 0) {
    failed.value = true;
  }
};

watch(
  () => props.picture,
  () => {
    loaded.value = false;
    failed.value = false;
    nextTick(syncFromElement);
  },
);

onMounted(() => {
  nextTick(syncFromElement);
});

const showImage = computed(() => Boolean(props.picture) && !failed.value);
const isLoadingImage = computed(() => showImage.value && !loaded.value);

const initials = computed(() => {
  const first = props.firstName?.[0] ?? "";
  const last = props.lastName?.[0] ?? "";
  const value = `${first}${last}`.trim();
  return value ? value.toUpperCase() : "?";
});

const altText = computed(() => {
  if (props.alt) return props.alt;
  const full = `${props.firstName ?? ""} ${props.lastName ?? ""}`.trim();
  return full || "Avatar";
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "h-6 w-6 text-[10px]";
    case "md":
      return "h-9 w-9 text-sm";
    case "lg":
      return "h-10 w-10 text-sm";
    case "xl":
      return "h-14 w-14 text-lg";
    default:
      return "h-8 w-8 text-xs";
  }
});

const spinnerClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "h-3 w-3 border-2";
    case "md":
      return "h-4 w-4 border-2";
    case "lg":
      return "h-5 w-5 border-2";
    case "xl":
      return "h-7 w-7 border-[3px]";
    default:
      return "h-4 w-4 border-2";
  }
});
</script>

<template>
  <div
    :data-testid="testId"
    class="relative shrink-0 overflow-hidden rounded-full"
    :class="sizeClasses"
  >
    <div
      class="flex h-full w-full items-center justify-center bg-primary-100 font-semibold text-primary-600"
    >
      <span
        v-if="isLoadingImage"
        class="animate-spin rounded-full border-primary-200 border-t-primary-500"
        :class="spinnerClasses"
        data-testid="avatar-loading"
      />
      <span v-else>{{ initials }}</span>
    </div>

    <img
      v-if="showImage"
      ref="imgEl"
      :src="picture ?? undefined"
      :alt="altText"
      class="absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-200"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      referrerpolicy="no-referrer"
      @load="loaded = true"
      @error="failed = true"
    />
  </div>
</template>
