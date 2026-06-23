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

const palette = [
  "bg-rose-100 text-rose-700",
  "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-pink-100 text-pink-700",
];

const colorClass = computed(() => {
  const key = `${props.firstName ?? ""} ${props.lastName ?? ""}`.trim();
  if (!key) return "bg-primary-100 text-primary-600";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
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
      class="flex h-full w-full items-center justify-center font-semibold"
      :class="colorClass"
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
