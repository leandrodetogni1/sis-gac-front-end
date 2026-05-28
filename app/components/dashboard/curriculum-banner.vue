<script setup lang="ts">
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";

const emit = defineEmits(["saved"]);

const { user, setUser } = useAuthState();
const { patchUser, loading, error } = useUsers();
const { curricula, getCurricula } = useCurricula();
const { showToastSuccess, showToastError } = useToastNotification();

const open = ref(false);
const selectedYear = ref<CurriculumYear | undefined>();
const fetchingCurricula = ref(false);

const options = computed(() =>
  curricula.value.map((c) => ({
    label: CurriculumYearLabels[c.year as CurriculumYear] ?? c.year,
    value: c.year,
  })),
);

const handleSave = async () => {
  if (!selectedYear.value || !user.value) return;
  try {
    const updated = await patchUser(user.value.id, { curriculumYear: selectedYear.value });
    setUser({ ...user.value, ...updated });
    showToastSuccess("Currículo atualizado");
    open.value = false;
    emit("saved");
  } catch {
    showToastError("Erro ao atualizar currículo");
  }
};

const handleOpen = async () => {
  selectedYear.value = (user.value?.curriculumYear as CurriculumYear | null) ?? undefined;
  open.value = true;
  fetchingCurricula.value = true;
  try {
    await getCurricula();
  } finally {
    fetchingCurricula.value = false;
  }
};
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 sm:flex-row sm:items-center sm:gap-4 dark:border-warning-800 dark:bg-warning-950/40 dark:text-warning-200"
    data-testid="curriculum-banner"
  >
    <Icon name="lucide:alert-triangle" size="1.25rem" class="shrink-0" />
    <div class="flex-1">
      <p class="font-medium">Complete seu cadastro</p>
      <p class="mt-0.5">
        Informe o ano do seu currículo para calcularmos os limites de horas corretamente.
      </p>
    </div>
    <SGButton size="sm" variant="primary" test-id="curriculum-banner-open" @click="handleOpen">
      Informar currículo
    </SGButton>

    <SGModal v-model:open="open" title="Currículo" description="Selecione o ano do seu currículo" test-id="curriculum-modal">
      <template #body>
        <div v-if="fetchingCurricula" class="flex items-center justify-center py-6">
          <span class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500" />
        </div>
        <div
          v-else-if="options.length === 0"
          class="rounded-lg border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-500"
        >
          Nenhum currículo configurado. Contate o administrador.
        </div>
        <SGSelect
          v-else
          v-model="selectedYear"
          :options="options"
          placeholder="Selecione o ano"
          test-id="curriculum-select"
        />
        <p v-if="error" class="mt-2 text-sm text-error-500">{{ error }}</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <SGButton variant="secondary" :disabled="loading" @click="open = false">Cancelar</SGButton>
          <SGButton
            variant="primary"
            test-id="curriculum-save"
            :loading="loading"
            :disabled="!selectedYear || loading"
            @click="handleSave"
          >
            Salvar
          </SGButton>
        </div>
      </template>
    </SGModal>
  </div>
</template>
