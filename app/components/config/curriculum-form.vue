<script setup lang="ts">
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import type { CreateCurriculumDto } from "~/interfaces/CreateCurriculumDto";

const props = defineProps<{
  availableYears: CurriculumYear[];
}>();

const emit = defineEmits(["created"]);

const { createCurriculum, loading } = useCurricula();
const { showToastSuccess, showToastError } = useToastNotification();

const year = ref<string>(props.availableYears[0] ?? "");
const minHoursPerCategory = ref<string | number>("");
const minCategoriesRequired = ref<string>("");
const excessToFreeMultiplier = ref<string | number>("1");
const minFreeHours = ref<string | number>("");

const yearOptions = computed(() =>
  props.availableYears.map((y) => ({
    value: y,
    label: CurriculumYearLabels[y],
  })),
);

const minCategoriesOptions = [
  { value: "2", label: "2 categorias" },
  { value: "3", label: "3 categorias" },
];

const isBlank = (v: unknown): boolean => v === null || v === undefined || v === "";

const requireMinCategories = computed(() => !isBlank(minHoursPerCategory.value));

const isValid = computed(() => {
  if (!year.value) return false;
  if (isBlank(excessToFreeMultiplier.value) || Number(excessToFreeMultiplier.value) < 0) return false;
  if (isBlank(minFreeHours.value) || Number(minFreeHours.value) < 0) return false;
  if (requireMinCategories.value && !minCategoriesRequired.value) return false;
  return true;
});

const buildPayload = (): CreateCurriculumDto => {
  const payload: CreateCurriculumDto = {
    year: year.value as CurriculumYear,
    excessToFreeMultiplier: Number(excessToFreeMultiplier.value),
    minFreeHours: Number(minFreeHours.value),
  };
  if (!isBlank(minHoursPerCategory.value)) {
    payload.minHoursPerCategory = Number(minHoursPerCategory.value);
  }
  if (minCategoriesRequired.value) {
    payload.minCategoriesRequired = Number(minCategoriesRequired.value);
  }
  return payload;
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;
  try {
    await createCurriculum(buildPayload());
    showToastSuccess("Currículo criado com sucesso");
    emit("created");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao criar currículo";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};
</script>

<template>
  <form data-testid="curriculum-form" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Ano <span class="text-error-500">*</span>
        </label>
        <SGSelect
          v-model="year"
          :options="yearOptions"
          placeholder="Selecione o ano"
          test-id="select-year"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Min. horas por categoria
          <span class="text-xs text-neutral-400">(opcional)</span>
        </label>
        <SGInput
          v-model="minHoursPerCategory"
          type="number"
          placeholder="Ex: 120"
          test-id="input-min-hours-per-category"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Min. categorias obrigatórias
          <span v-if="requireMinCategories" class="text-error-500">*</span>
          <span v-else class="text-xs text-neutral-400">(opcional)</span>
        </label>
        <SGSelect
          v-model="minCategoriesRequired"
          :options="minCategoriesOptions"
          placeholder="Selecione"
          test-id="select-min-categories"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Mult. excedente <span class="text-error-500">*</span>
        </label>
        <SGInput
          v-model="excessToFreeMultiplier"
          type="number"
          step="0.1"
          placeholder="Ex: 1"
          test-id="input-multiplier"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Min. horas livres <span class="text-error-500">*</span>
        </label>
        <SGInput
          v-model="minFreeHours"
          type="number"
          placeholder="Ex: 217"
          test-id="input-min-free-hours"
        />
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <SGButton
        variant="primary"
        test-id="submit-curriculum-button"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        icon="lucide:plus"
      >
        Criar Currículo
      </SGButton>
    </div>
  </form>
</template>
