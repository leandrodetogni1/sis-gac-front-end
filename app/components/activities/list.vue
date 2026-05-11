<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

const props = withDefaults(
  defineProps<{
    activities: ActivityResponseDto[];
    error: string | null;
    showUser?: boolean;
    canCreate?: boolean;
  }>(),
  { showUser: true, canCreate: true },
);

const emit = defineEmits(["retry", "select"]);

const columns = computed<SGTableColumn[]>(() => {
  const base: SGTableColumn[] = [
    { key: "activity", label: "Atividade" },
    { key: "category", label: "Categoria" },
    { key: "hours", label: "Horas" },
    { key: "startDate", label: "Data Início" },
  ];
  if (props.showUser) base.push({ key: "user", label: "Aluno" });
  base.push({ key: "status", label: "Status" });
  return base;
});

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
        <span class="text-neutral-500">{{ activity.activity_types?.category ?? "—" }}</span>
      </template>

      <template #cell-hours="{ item: activity }">
        <span class="text-neutral-500">{{ activity.hoursEquivalent ?? activity.hours ?? 0 }}h</span>
      </template>

      <template #cell-startDate="{ item: activity }">
        <span class="text-neutral-500">{{ formatDateTimeBR(activity.startDate) }}</span>
      </template>

      <template v-if="showUser" #cell-user="{ item: activity }">
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

      <template v-if="canCreate" #empty-action>
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
        <activities-card :activity="activity" :show-user="showUser" @select="emit('select', $event)" />
      </template>
    </SGTable>
  </SGCard>
</template>
