<script setup lang="ts">
useHead({ title: "Atividades — Configurações — SWGAC" });

const { activityTypes, fetched, error, getActivityTypes } = useActivityTypes();

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
        <div v-if="error" class="flex flex-col items-center justify-center py-12" data-testid="error-state">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
            <Icon name="lucide:wifi-off" size="2rem" class="text-error-400" />
          </div>
          <p class="mt-4 text-sm font-medium text-neutral-900">Falha ao carregar tipos de atividade</p>
          <p class="mt-1 text-sm text-neutral-500">{{ error }}</p>
          <SGButton test-id="retry-button" variant="primary" icon="lucide:refresh-cw" size="sm" class="mt-4" @click="getActivityTypes()">
            Tentar novamente
          </SGButton>
        </div>

        <div v-else-if="activityTypes.length === 0" class="flex flex-col items-center justify-center py-12" data-testid="empty-state">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Icon name="lucide:file-text" size="2rem" class="text-neutral-400" />
          </div>
          <p class="mt-4 text-sm font-medium text-neutral-900">Nenhum tipo de atividade encontrado</p>
          <p class="mt-1 text-sm text-neutral-500">Não há tipos de atividade cadastrados no momento.</p>
        </div>

        <div v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm" data-testid="activity-types-table">
              <thead>
                <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
                  <th class="pb-3 pr-4">Código</th>
                  <th class="pb-3 pr-4">Nome</th>
                  <th class="pb-3 pr-4">Categoria</th>
                  <th class="pb-3 pr-4">Unidade</th>
                  <th class="pb-3 pr-4">Max Horas (Complementares)</th>
                  <th class="pb-3">Max Horas (Semestre)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="type in activityTypes"
                  :key="type.id"
                  class="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                  :data-testid="`activity-type-row-${type.id}`"
                >
                  <td class="py-3 pr-4">
                    <span class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {{ type.cod }}
                    </span>
                  </td>
                  <td class="py-3 pr-4 font-medium text-neutral-900">{{ type.label }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ type.category ?? "—" }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ type.unity ?? "—" }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ formatHours(type.maxHoursInComplementarActivities) }}</td>
                  <td class="py-3 text-neutral-500">{{ formatHours(type.maxHoursPerCertificateOrSemester) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <div
              v-for="type in activityTypes"
              :key="type.id"
              class="rounded-lg border border-neutral-200 p-3"
              :data-testid="`activity-type-card-${type.id}`"
            >
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
            </div>
          </div>
        </div>
      </SGCard>
    </div>
  </div>
</template>
