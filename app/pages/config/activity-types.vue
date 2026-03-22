<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Atividades — Configurações — SWGAC" });

const { activityTypes, fetched, error, getActivityTypes } = useActivityTypes();

const columns: SGTableColumn[] = [
  { key: "cod", label: "Código" },
  { key: "label", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "unity", label: "Unidade" },
  { key: "maxHoursInComplementarActivities", label: "Max Horas (Complementares)" },
  { key: "maxHoursPerCertificateOrSemester", label: "Max Horas (Semestre)" },
];

const formatHours = (value: number | null) => {
  if (value === null || value === undefined) return "—";
  return `${value}h`;
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
      <div class="mb-4">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Tipos de Atividade</h2>
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
            </div>
            <div class="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              <span>Complementares: <span class="font-medium text-neutral-700">{{ formatHours(type.maxHoursInComplementarActivities) }}</span></span>
              <span>Semestre: <span class="font-medium text-neutral-700">{{ formatHours(type.maxHoursPerCertificateOrSemester) }}</span></span>
            </div>
          </template>
        </SGTable>
      </SGCard>
    </div>
  </div>
</template>
