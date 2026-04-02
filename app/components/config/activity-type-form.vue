<script setup lang="ts">
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";
import type { CreateActivityTypeDto } from "~/interfaces/CreateActivityTypeDto";
import type { UpdateActivityTypeDto } from "~/interfaces/UpdateActivityTypeDto";

const props = defineProps<{
  activityType?: ActivityTypeResponseDto;
}>();

const emit = defineEmits(["created", "updated"]);

const { createActivityType, updateActivityType, loading } = useActivityTypes();
const { showToastError } = useToastNotification();

const isEditing = computed(() => Boolean(props.activityType));

const cod = ref(props.activityType?.cod ?? "");
const label = ref(props.activityType?.label ?? "");
const category = ref(props.activityType?.category ?? "");
const unity = ref(props.activityType?.unity ?? "");
const maxHoursInComplementarActivities = ref(props.activityType?.maxHoursInComplementarActivities ?? 0);
const maxHoursPerCertificateOrSemester = ref(props.activityType?.maxHoursPerCertificateOrSemester ?? 0);

const categoryOptions = [
  { label: "Ensino", value: "ENSINO" },
  { label: "Pesquisa", value: "PESQUISA" },
  { label: "Extensão", value: "EXTENSAO" },
];

const unityOptions = [
  { label: "Semestre", value: "SEMESTRE" },
  { label: "Horas", value: "HORAS" },
  { label: "Unidade", value: "UNIDADE" },
];

const isValid = computed(() => {
  return cod.value.trim().length > 0 && label.value.trim().length > 0 && category.value.length > 0 && unity.value.length > 0;
});

const resetForm = () => {
  cod.value = "";
  label.value = "";
  category.value = "";
  unity.value = "";
  maxHoursInComplementarActivities.value = 0;
  maxHoursPerCertificateOrSemester.value = 0;
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const payload = {
    cod: cod.value.trim(),
    label: label.value.trim(),
    category: category.value,
    unity: unity.value,
    maxHoursInComplementarActivities: maxHoursInComplementarActivities.value,
    maxHoursPerCertificateOrSemester: maxHoursPerCertificateOrSemester.value,
  };

  try {
    if (isEditing.value) {
      await updateActivityType(props.activityType!.id, payload as UpdateActivityTypeDto);
      emit("updated");
    } else {
      await createActivityType(payload as CreateActivityTypeDto);
      resetForm();
      emit("created");
    }
  } catch (e: any) {
    const message = e?.data?.message ?? (isEditing.value ? "Erro ao atualizar tipo de atividade" : "Erro ao criar tipo de atividade");
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};
</script>

<template>
  <form data-testid="activity-type-form" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Código <span class="text-error-500">*</span> </label>
        <SGInput v-model="cod" placeholder="Ex: A, H1" test-id="input-cod" maxlength="10" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Nome <span class="text-error-500">*</span> </label>
        <SGInput v-model="label" placeholder="Ex: Monitoria" test-id="input-label" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Categoria <span class="text-error-500">*</span> </label>
        <SGSelect v-model="category" :options="categoryOptions" placeholder="Selecione" test-id="select-category" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Unidade <span class="text-error-500">*</span> </label>
        <SGSelect v-model="unity" :options="unityOptions" placeholder="Selecione" test-id="select-unity" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Max Horas (Complementares) <span class="text-error-500">*</span> </label>
        <SGInput
          :model-value="String(maxHoursInComplementarActivities)"
          type="number"
          placeholder="Ex: 102"
          test-id="input-max-hours-complementar"
          @update:model-value="maxHoursInComplementarActivities = Number($event)"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Max Horas (Semestre) <span class="text-error-500">*</span> </label>
        <SGInput
          :model-value="String(maxHoursPerCertificateOrSemester)"
          type="number"
          placeholder="Ex: 34"
          test-id="input-max-hours-semester"
          @update:model-value="maxHoursPerCertificateOrSemester = Number($event)"
        />
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <SGButton
        variant="primary"
        test-id="submit-activity-type-button"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        :icon="isEditing ? 'lucide:save' : 'lucide:plus'"
      >
        {{ isEditing ? "Salvar" : "Adicionar" }}
      </SGButton>
    </div>
  </form>
</template>
