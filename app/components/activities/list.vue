<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

defineProps<{
  activities: ActivityResponseDto[];
  error: string | null;
}>();

const emit = defineEmits(["retry", "select"]);

const columns: SGTableColumn[] = [
  { key: "activity", label: "Atividade" },
  { key: "category", label: "Categoria" },
  { key: "hours", label: "Horas" },
  { key: "startDate", label: "Data Início" },
  { key: "user", label: "Aluno" },
  { key: "status", label: "Status" },
];

const getLabel = (activity: ActivityResponseDto) => {
  return activity.activity_types?.label ?? activity.event ?? "—";
};

const getUserName = (activity: ActivityResponseDto) => {
  if (!activity.users) return "—";
  return `${activity.users.firstName} ${activity.users.lastName}`;
};
</script>

<template>
  <SGCard test-id="card-activities">
    <SGTable
      :columns="columns"
      :items="activities"
      :error="error"
      clickable
      error-text="Falha ao carregar atividades"
      empty-text="Nenhuma atividade encontrada"
      empty-description="Comece adicionando sua primeira atividade complementar."
      empty-icon="lucide:inbox"
      test-id="activities-table"
      @retry="emit('retry')"
      @row-click="emit('select', $event)"
    >
      <template #cell-activity="{ item: activity }">
        <span class="font-medium text-neutral-900">{{ getLabel(activity) }}</span>
      </template>

      <template #cell-category="{ item: activity }">
        <span class="text-neutral-500">{{ activity.category ?? "—" }}</span>
      </template>

      <template #cell-hours="{ item: activity }">
        <span class="text-neutral-500">{{ activity.hours ?? 0 }}h</span>
      </template>

      <template #cell-startDate="{ item: activity }">
        <span class="text-neutral-500">{{ activity.startDate ?? "—" }}</span>
      </template>

      <template #cell-user="{ item: activity }">
        <span
          v-if="activity.users"
          class="cursor-pointer text-primary-700 hover:underline"
          @click.stop="navigateTo(`/members/${activity.users.id}`)"
        >
          {{ getUserName(activity) }}
        </span>
        <span v-else class="text-neutral-500">—</span>
      </template>

      <template #cell-status="{ item: activity }">
        <SGBadge :status="activity.status || 'pending'" :test-id="`badge-${activity.id}`" />
      </template>

      <template #empty-action>
        <SGButton
          test-id="empty-state-create-button"
          variant="primary"
          icon="lucide:plus"
          size="sm"
          @click="navigateTo('/activities/create')"
        >
          Criar Atividade
        </SGButton>
      </template>

      <template #mobile="{ item: activity }">
        <activities-card :activity="activity" @select="emit('select', $event)" />
      </template>
    </SGTable>
  </SGCard>
</template>
