<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  testId?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

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

const open = ref(false);
</script>

<template>
  <UInputDate
    v-model="calendarValue"
    locale="pt-BR"
    :min-value="minCalendarValue"
    :max-value="maxCalendarValue"
    :disabled="disabled"
    :data-testid="testId"
    class="w-full"
    :ui="{ base: 'h-11 py-0 text-base sm:h-8 sm:text-sm' }"
  >
    <template #trailing>
      <UPopover v-model:open="open" :disabled="disabled">
        <button
          type="button"
          :disabled="disabled"
          aria-label="Abrir calendário"
          :data-testid="testId ? `${testId}-calendar` : undefined"
          class="rounded p-0.5 text-dimmed transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="lucide:calendar" size="1rem" class="block" />
        </button>

        <template #content>
          <UCalendar
            v-model="calendarValue"
            locale="pt-BR"
            :min-value="minCalendarValue"
            :max-value="maxCalendarValue"
            class="p-2"
            @update:model-value="open = false"
          />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
