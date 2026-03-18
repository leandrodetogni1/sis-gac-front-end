<script setup lang="ts">
useHead({ title: "Atividades — SWGAC" });

const { activities, fetched, getActivities, filterByStatus } = useActivities();

const typeLabel = (type: string) => {
  return type === "complementar" ? "Complementar" : "Livre";
};

onMounted(async () => {
  await getActivities();
});
</script>

<template>
  <div>
    <div
      v-if="!fetched"
      class="flex min-h-[60vh] items-center justify-center"
      data-testid="page-loading"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else>
      <SGCard test-id="card-activities">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-base font-semibold text-neutral-900 md:text-lg">
            Atividades Complementares
          </h2>
          <SGButton
            test-id="create-activity-button"
            variant="primary"
            icon="lucide:plus"
            size="sm"
            @click="navigateTo('/activities/create')"
          >
            Nova Atividade
          </SGButton>
        </div>

        <div
          v-if="activities.length === 0"
          class="flex flex-col items-center justify-center py-12"
          data-testid="empty-state"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Icon name="lucide:inbox" size="2rem" class="text-neutral-400" />
          </div>
          <p class="mt-4 text-sm font-medium text-neutral-900">Nenhuma atividade encontrada</p>
          <p class="mt-1 text-sm text-neutral-500">Comece adicionando sua primeira atividade complementar.</p>
          <SGButton
            test-id="empty-state-create-button"
            variant="primary"
            icon="lucide:plus"
            size="sm"
            class="mt-4"
            @click="navigateTo('/activities/create')"
          >
            Criar Atividade
          </SGButton>
        </div>

        <div v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm" data-testid="activities-table">
              <thead>
                <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
                  <th class="pb-3 pr-4">Atividade</th>
                  <th class="pb-3 pr-4">Tipo</th>
                  <th class="pb-3 pr-4">Horas</th>
                  <th class="pb-3 pr-4">Data</th>
                  <th class="pb-3 pr-4">Aluno</th>
                  <th class="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="activity in activities"
                  :key="activity.id"
                  class="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                  :data-testid="`activity-row-${activity.id}`"
                >
                  <td class="py-3 pr-4 font-medium text-neutral-900">{{ activity.title }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ typeLabel(activity.type) }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ activity.hours }}h</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ activity.date }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ activity.user.name }}</td>
                  <td class="py-3">
                    <SGBadge :status="activity.status" :test-id="`badge-${activity.id}`" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="rounded-lg border border-neutral-200 p-3"
              :data-testid="`activity-card-${activity.id}`"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-medium text-neutral-900">{{ activity.title }}</p>
                  <p class="mt-0.5 text-xs text-neutral-500">{{ typeLabel(activity.type) }} · {{ activity.user.name }}</p>
                </div>
                <SGBadge :status="activity.status" />
              </div>
              <div class="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span class="font-medium text-neutral-700">{{ activity.hours }}h</span>
                <span>{{ activity.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </SGCard>
    </div>
  </div>
</template>
