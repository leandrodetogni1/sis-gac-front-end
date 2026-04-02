<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";

useHead({ title: "Atividades — Configurações — SWGAC" });

const { activityTypes, fetched, loading, error, getActivityTypes, deleteActivityType } = useActivityTypes();
const { showToastSuccess, showToastError } = useToastNotification();
const { confirmAlert } = useAlerts();

const columns: SGTableColumn[] = [
  { key: "cod", label: "Código" },
  { key: "label", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "unity", label: "Unidade" },
  { key: "maxHoursInComplementarActivities", label: "Max Horas (Complementares)" },
  { key: "maxHoursPerCertificateOrSemester", label: "Max Horas (Semestre)" },
  { key: "actions", label: "Ações", align: "right" },
];

const createModal = ref(false);
const editModal = ref(false);
const selectedActivityType = ref<ActivityTypeResponseDto | null>(null);

const formatHours = (value: number | null) => {
  if (value === null || value === undefined) return "—";
  return `${value}h`;
};

const openEdit = (activityType: ActivityTypeResponseDto) => {
  selectedActivityType.value = activityType;
  editModal.value = true;
};

const handleCreated = async () => {
  createModal.value = false;
  showToastSuccess("Tipo de atividade criado com sucesso");
  await getActivityTypes();
};

const handleUpdated = async () => {
  editModal.value = false;
  selectedActivityType.value = null;
  showToastSuccess("Tipo de atividade atualizado com sucesso");
  await getActivityTypes();
};

const handleDelete = async (id: string, label: string) => {
  const confirmed = await confirmAlert(
    `O tipo de atividade "${label}" será removido permanentemente.`,
    "Remover tipo de atividade?",
    "warning",
  );
  if (!confirmed) return;

  try {
    await deleteActivityType(id);
    showToastSuccess("Tipo de atividade removido com sucesso");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao remover tipo de atividade";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};

onMounted(async () => {
  await getActivityTypes();
});
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando tipos de atividade...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Tipos de Atividade</h2>
        <SGButton
          test-id="toggle-activity-type-form-button"
          variant="primary"
          icon="lucide:plus"
          @click="createModal = true"
        >
          Adicionar Tipo
        </SGButton>
      </div>

      <SGCard test-id="card-activity-types">
        <SGTable
          :columns="columns"
          :items="activityTypes"
          :error="error"
          error-text="Falha ao carregar tipos de atividade"
          empty-text="Nenhum tipo de atividade encontrado"
          empty-description="Não há tipos de atividade cadastrados no momento."
          empty-icon="lucide:file-text"
          test-id="activity-types-table"
          @retry="getActivityTypes()"
        >
          <template #cell-cod="{ item: type }">
            <span class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
              {{ type.cod }}
            </span>
          </template>

          <template #cell-label="{ item: type }">
            <span class="font-medium text-neutral-900">{{ type.label }}</span>
          </template>

          <template #cell-category="{ item: type }">
            <span class="text-neutral-500">{{ type.category ?? "—" }}</span>
          </template>

          <template #cell-unity="{ item: type }">
            <span class="text-neutral-500">{{ type.unity ?? "—" }}</span>
          </template>

          <template #cell-maxHoursInComplementarActivities="{ item: type }">
            <span class="text-neutral-500">{{ formatHours(type.maxHoursInComplementarActivities) }}</span>
          </template>

          <template #cell-maxHoursPerCertificateOrSemester="{ item: type }">
            <span class="text-neutral-500">{{ formatHours(type.maxHoursPerCertificateOrSemester) }}</span>
          </template>

          <template #cell-actions="{ item: type }">
            <div class="flex items-center justify-end gap-1">
              <button
                :data-testid="`edit-activity-type-${type.id}`"
                class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
                :disabled="loading"
                @click="openEdit(type)"
              >
                <Icon name="lucide:pencil" size="1rem" />
              </button>
              <button
                :data-testid="`delete-activity-type-${type.id}`"
                class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                :disabled="loading"
                @click="handleDelete(type.id, type.label)"
              >
                <Icon name="lucide:trash-2" size="1rem" />
              </button>
            </div>
          </template>

          <template #mobile="{ item: type }">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {{ type.cod }}
                  </span>
                  <p class="font-medium text-neutral-900">{{ type.label }}</p>
                </div>
                <p class="mt-1 text-xs text-neutral-500">{{ type.category ?? "—" }} · {{ type.unity ?? "—" }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  :data-testid="`edit-activity-type-mobile-${type.id}`"
                  class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
                  :disabled="loading"
                  @click="openEdit(type)"
                >
                  <Icon name="lucide:pencil" size="1rem" />
                </button>
                <button
                  :data-testid="`delete-activity-type-mobile-${type.id}`"
                  class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                  :disabled="loading"
                  @click="handleDelete(type.id, type.label)"
                >
                  <Icon name="lucide:trash-2" size="1rem" />
                </button>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              <span>Complementares: <span class="font-medium text-neutral-700">{{ formatHours(type.maxHoursInComplementarActivities) }}</span></span>
              <span>Semestre: <span class="font-medium text-neutral-700">{{ formatHours(type.maxHoursPerCertificateOrSemester) }}</span></span>
            </div>
          </template>
          <template #empty-action>
            <SGButton test-id="empty-state-add-button" variant="primary" icon="lucide:plus" size="sm" @click="createModal = true">
              Adicionar Tipo
            </SGButton>
          </template>
        </SGTable>
      </SGCard>

      <SGModal v-model:open="createModal" title="Novo Tipo de Atividade" description="Preencha os dados do novo tipo de atividade">
        <config-activity-type-form @created="handleCreated" />
      </SGModal>

      <SGModal v-model:open="editModal" title="Editar Tipo de Atividade" description="Altere os dados do tipo de atividade">
        <config-activity-type-form
          v-if="selectedActivityType"
          :activity-type="selectedActivityType"
          @updated="handleUpdated"
        />
      </SGModal>
    </div>
  </div>
</template>
