<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

const props = withDefaults(
  defineProps<{
    activities: ActivityResponseDto[];
    error: string | null;
    showUser?: boolean;
    canCreate?: boolean;
    sortable?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>(),
  { showUser: true, canCreate: true, sortable: false },
);

const emit = defineEmits(["retry", "select", "sort"]);

const columns = computed<SGTableColumn[]>(() => {
  const base: SGTableColumn[] = [
    { key: "event", label: "Evento" },
    { key: "activity", label: "Atividade" },
    { key: "category", label: "Categoria" },
    { key: "hours", label: "Horas", sortKey: props.sortable ? "hoursEquivalent" : undefined },
    { key: "createdAt", label: "Data de criação", sortKey: props.sortable ? "createdAt" : undefined },
  ];
  if (props.showUser) base.push({ key: "user", label: "Aluno" });
  base.push({ key: "status", label: "Status", sortKey: props.sortable ? "status" : undefined });
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
      :sort-by="sortBy"
      :sort-order="sortOrder"
      clickable
      error-text="Falha ao carregar atividades"
      empty-text="Nenhuma atividade encontrada"
      empty-description="Comece adicionando sua primeira atividade complementar."
      empty-icon="lucide:inbox"
      test-id="activities-table"
      @retry="emit('retry')"
      @row-click="emit('select', $event)"
      @sort="emit('sort', $event)"
    >
      <template #cell-event="{ item: activity }">
        <span class="font-medium text-neutral-900">{{ activity.event ?? "—" }}</span>
      </template>

      <template #cell-activity="{ item: activity }">
        <span class="text-neutral-500">{{ getLabel(activity) }}</span>
      </template>

      <template #cell-category="{ item: activity }">
        <span class="text-neutral-500">{{ formatCategory(activity.activity_types?.category) }}</span>
      </template>

      <template #cell-hours="{ item: activity }">
        <span class="text-neutral-500">{{ formatHours(activity.hoursEquivalent ?? activity.hours) }}</span>
      </template>

      <template #cell-createdAt="{ item: activity }">
        <span class="text-neutral-500">{{ formatDateBR(activity.createdAt) }}</span>
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
