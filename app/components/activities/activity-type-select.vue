<script setup lang="ts">
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";

const props = defineProps<{
  modelValue?: string;
  testId?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
  (e: "change", type: ActivityTypeResponseDto | null): void;
}>();

const { activityTypes, loading, error, getActivityTypes } = useActivityTypes();

const options = computed(() => {
  return activityTypes.value.map((t) => ({
    label: `${t.cod} — ${t.label}`,
    value: t.id,
  }));
});

const placeholder = computed(() => {
  if (loading.value) return "Carregando...";
  if (error.value) return "Erro ao carregar tipos";
  return "Selecione o tipo de atividade";
});

const findTypeById = (id: string | undefined) =>
  id ? activityTypes.value.find((t) => t.id === id) ?? null : null;

const handleChange = (value: string | undefined) => {
  emit("update:modelValue", value);
  emit("change", findTypeById(value));
};

onMounted(async () => {
  await getActivityTypes();
  if (props.modelValue) {
    emit("change", findTypeById(props.modelValue));
  }
});
</script>

<template>
  <SGSelect
    :model-value="props.modelValue"
    :options="options"
    :placeholder="placeholder"
    :disabled="loading || !!error"
    :test-id="props.testId"
    @update:model-value="handleChange"
  />
</template>
