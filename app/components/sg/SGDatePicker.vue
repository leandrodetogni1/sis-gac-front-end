<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  testId?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const df = new DateFormatter("pt-BR", { dateStyle: "medium" });

const toCalendarDate = (value?: string | null): CalendarDate | undefined => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new CalendarDate(year, month, day);
};

const minCalendarValue = computed(() => toCalendarDate(props.minDate));
const maxCalendarValue = computed(() => toCalendarDate(props.maxDate));

const calendarValue = computed({
  get() {
    return toCalendarDate(props.modelValue);
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
      class="flex min-h-11 w-full items-center gap-2 rounded-md border border-accented bg-default px-2.5 py-1.5 text-base transition-colors hover:border-inverted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-8 sm:text-sm"
    >
      <Icon name="lucide:calendar" size="1rem" class="shrink-0 text-dimmed" />
      <span :class="calendarValue ? 'text-default' : 'text-dimmed'">
        {{ displayText }}
      </span>
    </button>

    <template #content>
      <UCalendar
        v-model="calendarValue"
        locale="pt-BR"
        :min-value="minCalendarValue"
        :max-value="maxCalendarValue"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
