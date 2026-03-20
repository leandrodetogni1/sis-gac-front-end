<script setup lang="ts">
const props = defineProps<{
  modelValue?: string;
  testId?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

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

onMounted(async () => {
  await getActivityTypes();
});
</script>

<template>
  <SGSelect
    :model-value="props.modelValue"
    :options="options"
    :placeholder="placeholder"
    :disabled="loading || !!error"
    :test-id="props.testId"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
