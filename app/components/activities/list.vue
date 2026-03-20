<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

defineProps<{
  activities: ActivityResponseDto[];
  error: string | null;
}>();

const emit = defineEmits(["retry", "select"]);
</script>

<template>
  <SGCard test-id="card-activities">
    <div v-if="error" class="flex flex-col items-center justify-center py-12" data-testid="error-state">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <Icon name="lucide:wifi-off" size="2rem" class="text-red-400" />
      </div>
      <p class="mt-4 text-sm font-medium text-neutral-900">Falha ao carregar atividades</p>
      <p class="mt-1 text-sm text-neutral-500">{{ error }}</p>
      <SGButton test-id="retry-button" variant="primary" icon="lucide:refresh-cw" size="sm" class="mt-4" @click="emit('retry')">
        Tentar novamente
      </SGButton>
    </div>

    <div v-else-if="activities.length === 0" class="flex flex-col items-center justify-center py-12" data-testid="empty-state">
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
              <th class="pb-3 pr-4">Categoria</th>
              <th class="pb-3 pr-4">Horas</th>
              <th class="pb-3 pr-4">Data Início</th>
              <th class="pb-3 pr-4">Aluno</th>
              <th class="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <activities-table-row v-for="activity in activities" :key="activity.id" :activity="activity" @select="emit('select', $event)" />
          </tbody>
        </table>
      </div>

      <div class="space-y-3 md:hidden">
        <activities-card v-for="activity in activities" :key="activity.id" :activity="activity" @select="emit('select', $event)" />
      </div>
    </div>
  </SGCard>
</template>
