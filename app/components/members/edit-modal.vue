<script setup lang="ts">
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import { Situation, SituationLabels } from "~/enums/Situation";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

const props = defineProps<{
  user: UserResponseDto;
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{
  (e: "updated", value: UserResponseDto): void;
}>();

const { patchUser, loading, error } = useUsers();
const { curricula, getCurricula } = useCurricula();
const { showToastSuccess, showToastError } = useToastNotification();

const situationOptions = Object.values(Situation).map((value) => ({
  label: SituationLabels[value],
  value,
}));

const curriculumOptions = computed(() =>
  curricula.value.map((c) => ({
    label: CurriculumYearLabels[c.year as CurriculumYear] ?? c.year,
    value: c.year,
  })),
);

const situation = ref<Situation | undefined>();
const curriculumYear = ref<CurriculumYear | undefined>();

watch(open, async (value) => {
  if (!value) return;
  situation.value = (props.user.situation as Situation | null) ?? undefined;
  curriculumYear.value = (props.user.curriculumYear as CurriculumYear | null) ?? undefined;
  await getCurricula();
});

const hasChanges = computed(() => {
  const originalSituation = (props.user.situation as Situation | null) ?? undefined;
  const originalCurriculum = (props.user.curriculumYear as CurriculumYear | null) ?? undefined;
  return situation.value !== originalSituation || curriculumYear.value !== originalCurriculum;
});

const handleSave = async () => {
  if (!hasChanges.value) {
    open.value = false;
    return;
  }
  try {
    const payload: { situation?: string; curriculumYear?: string } = {};
    if (situation.value) payload.situation = situation.value;
    if (curriculumYear.value) payload.curriculumYear = curriculumYear.value;
    const updated = await patchUser(props.user.id, payload);
    showToastSuccess("Aluno atualizado");
    emit("updated", updated);
    open.value = false;
  } catch {
    showToastError("Erro ao atualizar aluno");
  }
};
</script>

<template>
  <SGModal
    v-model:open="open"
    title="Editar aluno"
    description="Ajuste situação e currículo do aluno"
    test-id="member-edit-modal"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div>
          <label class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
            Situação
          </label>
          <SGSelect
            v-model="situation"
            :options="situationOptions"
            placeholder="Selecione a situação"
            test-id="member-edit-situation"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
            Currículo
          </label>
          <SGSelect
            v-model="curriculumYear"
            :options="curriculumOptions"
            placeholder="Selecione o ano do currículo"
            test-id="member-edit-curriculum"
          />
        </div>

        <p v-if="error" class="text-sm text-error-500">{{ error }}</p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <SGButton variant="secondary" :disabled="loading" @click="open = false">
          Cancelar
        </SGButton>
        <SGButton
          variant="primary"
          test-id="member-edit-save"
          :loading="loading"
          :disabled="loading || !hasChanges"
          @click="handleSave"
        >
          Salvar
        </SGButton>
      </div>
    </template>
  </SGModal>
</template>
