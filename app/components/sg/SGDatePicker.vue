<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const df = new DateFormatter("pt-BR", { dateStyle: "medium" });

const calendarValue = computed({
  get() {
    if (!props.modelValue) return undefined;
    const [year, month, day] = props.modelValue.split("-").map(Number);
    return new CalendarDate(year, month, day);
  },
  set(val: CalendarDate | undefined) {
    if (val) {
      const iso = `${val.year}-${String(val.month).padStart(2, "0")}-${String(val.day).padStart(2, "0")}`;
      emit("update:modelValue", iso);
    } else {
      emit("update:modelValue", "");
    }
  },
});

const displayText = computed(() => {
  if (calendarValue.value) {
    return df.format(calendarValue.value.toDate(getLocalTimeZone()));
  }
  return props.placeholder ?? "Selecione uma data";
});
</script>

<template>
  <UPopover :disabled="disabled">
    <button
      type="button"
      :disabled="disabled"
      :data-testid="testId"
      class="flex w-full items-center gap-2 rounded-md border border-accented bg-default px-2.5 py-1.5 text-sm transition-colors hover:border-inverted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="lucide:calendar" size="1rem" class="shrink-0 text-dimmed" />
      <span :class="calendarValue ? 'text-default' : 'text-dimmed'">
        {{ displayText }}
      </span>
    </button>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" />
    </template>
  </UPopover>
</template>
