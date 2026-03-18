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
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
      block
      class="justify-start"
      :disabled="disabled"
      :data-testid="testId"
    >
      <span :class="calendarValue ? 'text-neutral-900' : 'text-neutral-400'">
        {{ displayText }}
      </span>
    </UButton>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" />
    </template>
  </UPopover>
</template>
